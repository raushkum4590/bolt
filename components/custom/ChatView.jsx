"use client";
import Colors from '@/app/data/Colors';
import Lookup from '@/app/data/Lookup';
import Prompt from '@/app/data/Prompt';
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, ArrowUpCircle, Bot, LinkIcon, Loader2Icon, SendHorizontal, User } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

function ChatView() {
    const {id} = useParams();
    const router = useRouter();
    const convex = useConvex();
    const {messages, setMessages} = useContext(MessagesContext);
    const {userDetail, setUserDetail} = useContext(UserDetailContext);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [remainingTokens, setRemainingTokens] = useState(0);
    const [dailyTokens, setDailyTokens] = useState(1000); // Daily token limit
    const [dailyTokensUsed, setDailyTokensUsed] = useState(0); // Track daily tokens used
    const DAILY_TOKEN_LIMIT = 1000; // Daily token limit
    const UpdateMessages = useMutation(api.workspace.UpdateMessages);
    const {toggleSidebar} = useSidebar();
    const UpdateToken = useMutation(api.users.UpdateToken);
    const RefreshDailyTokens = useMutation(api.users.RefreshDailyTokens);
    const messagesEndRef = useRef(null);
    
    // Token counting function - approximate tokens using characters
    const countTokens = (text) => {
        // GPT models use ~4 characters per token on average
        return Math.ceil(text.length / 4);
    };

    const onGenerate = (input) => {
        setMessages(prev => [...prev, {
            role: 'user',
            content: input
        }]);
        setUserInput('')
    }

    useEffect(() => {
        id && GetWorkspaceData();
    }, [id]);

    const GetWorkspaceData = async() => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        setMessages(result?.messages);
        console.log(result);
    }

    useEffect(() => {
        if (userDetail) {
            setRemainingTokens(userDetail.token);
            checkAndRefreshDailyTokens();
        }
    }, [userDetail]);

    // Function to check and refresh daily tokens if needed
    const checkAndRefreshDailyTokens = async () => {
        if (userDetail && userDetail._id) {
            try {
                const result = await RefreshDailyTokens({
                    userId: userDetail._id
                });
                
                if (result.success) {
                    if (result.dailyTokensRefreshed) {
                        // Daily tokens were refreshed
                        setDailyTokensUsed(0);
                        setDailyTokens(result.dailyTokenLimit || DAILY_TOKEN_LIMIT);
                    } else {
                        // No refresh needed, just update the UI
                        setDailyTokensUsed(result.dailyTokensUsed || 0);
                        setDailyTokens(result.dailyTokenLimit || DAILY_TOKEN_LIMIT);
                    }
                }
            } catch (error) {
                console.error("Error refreshing daily tokens:", error);
            }
        }
    };

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length-1].role;
            if (role == 'user') {
                GetAiResponse();
            }
        }
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    const GetAiResponse = async() => {
        setLoading(true);
        
        // Check if user has enough tokens
        if (userDetail && userDetail.token <= 0) {
            setShowUpgradeDialog(true);
            setLoading(false);
            return;
        }
        
        // Check if daily token limit is exceeded
        if (dailyTokensUsed >= dailyTokens) {
            setShowUpgradeDialog(true);
            setLoading(false);
            return;
        }
        
        const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
        try {
            const result = await axios.post('/api/ai-chat', {
                prompt: PROMPT
            });
           
            const aiResp = {
                role: 'ai',
                content: result.data.result
            }
            
            // Calculate token usage for this response
            const tokenUsed = countTokens(aiResp.content);
            
            // Update remaining tokens
            const newTokenBalance = Math.max(0, userDetail.token - tokenUsed);
            setRemainingTokens(newTokenBalance);
            
            // Update daily tokens used
            const newDailyTokensUsed = dailyTokensUsed + tokenUsed;
            setDailyTokensUsed(newDailyTokensUsed);
            
            // Update token count in database
            if (userDetail && userDetail._id) {
                await UpdateToken({
                    token: newTokenBalance,
                    userId: userDetail._id,
                    dailyTokensUsed: newDailyTokensUsed
                });
            }
            
            // Check if user has run out of tokens after this response
            if (newTokenBalance === 0 || newDailyTokensUsed >= dailyTokens) {
                setShowUpgradeDialog(true);
            }
            
            setMessages(prev => [...prev, aiResp])
            
            await UpdateMessages({
                messages: [...messages, aiResp],
                workspaceId: id
            });
        } catch (error) {
            console.error("Error getting AI response:", error);
            // Add error handling UI if needed
        } finally {
            setLoading(false);
        }
    };
        
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && userInput.trim()) {
            e.preventDefault();
            onGenerate(userInput);
        }
    };

    return (
        <div className="relative h-[85vh] flex flex-col bg-black/5 rounded-xl shadow-lg border border-gray-800">
            <div className="px-4 py-3 border-b border-gray-800 bg-black/30 backdrop-blur-sm rounded-t-xl">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-200 flex items-center gap-2">
                        <Bot size={16} className="text-blue-400" />
                        Chat Assistant
                    </h2>
                    {userDetail && (
                        <div className="text-xs text-gray-400 flex items-center gap-3">
                            <div>
                                <span className={`${remainingTokens < 1000 ? 'text-orange-400' : 'text-blue-400'}`}>
                                    {(remainingTokens || 0).toLocaleString()} tokens
                                </span>
                                <span> remaining</span>
                            </div>
                            <div className="border-l border-gray-700 pl-3">
                                <span className={`${(dailyTokens - dailyTokensUsed) < 200 ? 'text-orange-400' : 'text-green-400'}`}>
                                    {Math.max(0, dailyTokens - dailyTokensUsed).toLocaleString()}
                                </span>
                                <span> / {dailyTokens.toLocaleString()} daily</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                {messages?.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex gap-3 items-start max-w-full animate-in fade-in slide-in-from-bottom-5 duration-300 ${msg?.role === 'user' ? '' : 'opacity-90'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {msg?.role === 'user' ? (
                                        userDetail?.picture ? (
                                            <Image 
                                                src={userDetail.picture} 
                                                alt="User" 
                                                width={32} 
                                                height={32} 
                                                className="rounded-full border-2 border-blue-500/50" 
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                                <User size={16} className="text-white" />
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <Bot size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`py-3 px-4 rounded-lg leading-relaxed ${
                                    msg?.role === 'user' 
                                        ? 'bg-blue-900/20 border border-blue-500/30' 
                                        : 'bg-gray-800/70 border border-gray-700/50'
                                }`}>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="flex gap-3 items-start animate-in fade-in duration-300">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="py-4 px-5 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center gap-2">
                                    <Loader2Icon className="animate-spin h-4 w-4 text-blue-400" />
                                    <span className="text-sm text-gray-300">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4 border border-blue-500/30">
                            <Bot size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">Start a new conversation</h3>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Ask me anything about your project, code, or development questions.
                        </p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-black/20 rounded-b-xl">
                <div className="flex gap-3 items-end">
                    {userDetail && (
                        <button 
                            onClick={toggleSidebar}
                            className="flex-shrink-0 transition-transform hover:scale-105"
                        >
                            <Image 
                                src={userDetail?.picture} 
                                alt="userImage" 
                                width={32} 
                                height={32} 
                                className="rounded-full border border-blue-500/50 cursor-pointer" 
                            />
                        </button>
                    )}
                    
                    <div className="relative flex-1 rounded-lg border border-gray-700 focus-within:border-blue-500/50 transition-all bg-black/30 shadow-inner overflow-hidden">
                        <textarea
                            placeholder={Lookup.INPUT_PLACEHOLDER}
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className="outline-none bg-transparent w-full py-3 px-4 text-sm max-h-32 min-h-[60px] resize-none text-gray-100 placeholder:text-gray-500"
                            rows={1}
                        />
                        
                        <div className="absolute right-2 bottom-2 flex space-x-1">
                            {userInput && (
                                <Button
                                    onClick={() => onGenerate(userInput)}
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showUpgradeDialog && (
                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Bot className="h-5 w-5 text-blue-400" />
                                <span>Upgrade Your Plan</span>
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                You've used all your available tokens. Upgrade to continue using the AI assistant with enhanced features.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-col space-y-3">
                                {/* Plan options */}
                                <div className="border border-blue-500/30 bg-blue-900/20 rounded-lg p-4 hover:border-blue-500/70 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-blue-400">Pro Plan</h3>
                                            <p className="text-sm text-gray-300">10,000 tokens per month</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">$9.99</div>
                                            <div className="text-xs text-gray-400">per month</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border border-purple-500/30 bg-purple-900/20 rounded-lg p-4 hover:border-purple-500/70 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-purple-400">Premium Plan</h3>
                                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs px-2 py-0.5 rounded-full text-white">Best Value</span>
                                            </div>
                                            <p className="text-sm text-gray-300">Unlimited tokens</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">$19.99</div>
                                            <div className="text-xs text-gray-400">per month</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Features list */}
                            <div className="py-2">
                                <h4 className="text-sm font-medium text-gray-200 mb-2">All plans include:</h4>
                                <ul className="space-y-1">
                                    {[
                                        "Advanced AI code assistance",
                                        "Workspace history & saving",
                                        "Priority support",
                                        "Regular feature updates"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <ArrowRight className="h-3 w-3 text-blue-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <DialogFooter className="flex sm:justify-between gap-3 mt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowUpgradeDialog(false)}
                                className="border-gray-700 hover:bg-gray-800 text-gray-300"
                            >
                                Maybe later
                            </Button>
                            <Button 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6"
                                onClick={() => router.push('/upgrade')}
                            >
                                Upgrade Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default ChatView;