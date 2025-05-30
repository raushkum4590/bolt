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
import { useSidebar } from './CustomSidebar';
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
                    <div className="flex flex-col gap-6">                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex gap-4 items-start max-w-full animate-in fade-in slide-in-from-bottom-5 duration-500 ${msg?.role === 'user' ? '' : 'opacity-95'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {msg?.role === 'user' ? (
                                        userDetail?.picture ? (
                                            <div className="relative p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                                                <Image 
                                                    src={userDetail.picture} 
                                                    alt="User" 
                                                    width={32} 
                                                    height={32} 
                                                    className="rounded-full bg-gray-900" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                <User size={16} className="text-white" />
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                                            <Bot size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`group relative py-4 px-6 rounded-2xl leading-relaxed shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                                    msg?.role === 'user' 
                                        ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 hover:border-blue-400/50 max-w-[85%] ml-auto' 
                                        : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 hover:border-gray-600/50 max-w-[90%]'
                                } before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none`}>
                                    <div className="prose prose-invert prose-sm max-w-none relative z-10">
                                        {msg.content}
                                    </div>
                                    {msg?.role === 'assistant' && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button className="p-1 rounded-md hover:bg-white/10 transition-colors">
                                                <LinkIcon size={12} className="text-gray-400" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                          {loading && (
                            <div className="flex gap-4 items-start animate-in fade-in duration-500">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="py-4 px-6 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm shadow-lg flex items-center gap-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                    </div>
                                    <span className="text-sm text-gray-300 ml-2">AI is thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-blue-500/30 backdrop-blur-sm">
                                <Bot size={32} className="text-blue-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-xs">✨</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
                            Start a new conversation
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                            Ask me anything about your project, code, or development questions. I'm here to help you build amazing things!
                        </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {[
                                "💡 Generate ideas",
                                "🔧 Debug code", 
                                "🎨 Create UI",
                                "📖 Explain concepts"
                            ].map((suggestion, i) => (
                                <div key={i} className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 backdrop-blur-sm">
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>            <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl rounded-b-xl">
                <div className="flex gap-3 items-end">
                    {userDetail && (
                        <button 
                            onClick={toggleSidebar}
                            className="flex-shrink-0 transition-all hover:scale-105 duration-300 group"
                        >
                            <div className="relative p-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg group-hover:shadow-blue-500/25">
                                <Image 
                                    src={userDetail?.picture} 
                                    alt="userImage" 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full bg-gray-900 cursor-pointer" 
                                />
                            </div>
                        </button>
                    )}
                    
                    <div className="relative flex-1 rounded-xl border border-gray-700/50 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>                        <textarea
                            placeholder={Lookup.INPUT_PLACEHOLDER}
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className="outline-none bg-transparent w-full py-4 px-5 text-sm max-h-32 min-h-[60px] resize-none text-gray-100 placeholder:text-gray-500 relative z-10"
                            rows={1}
                        />
                        
                        <div className="absolute right-3 bottom-3 flex space-x-2 z-10">
                            {userInput && (
                                <Button
                                    onClick={() => onGenerate(userInput)}
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border-0"
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