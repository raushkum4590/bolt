"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from './CustomSidebar';
import { FileText, Loader2, MessageSquare, Plus, RefreshCw, Search } from 'lucide-react';

function WorkspaceHistory() {
    const { userDetail } = useContext(UserDetailContext);
    const convex = useConvex();
    const [workspaceList, setWorkspaceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toggleSidebar } = useSidebar();
    const pathname = usePathname();

    useEffect(() => {
        if (userDetail && userDetail._id) {
            GetAllWorkspace();
        }
    }, [userDetail]);

    const GetAllWorkspace = async () => {
        try {
            setLoading(true);
            // Only attempt query if userDetail._id exists
            if (!userDetail || !userDetail._id) {
                setWorkspaceList([]);
                return;
            }
            
            const result = await convex.query(api.workspace.GetAllWorkspace, {
                userId: userDetail._id,
            });
            setWorkspaceList(result || []);
        } catch (error) {
            console.error("Error fetching workspaces:", error);
            setWorkspaceList([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter workspaces based on search term
    const filteredWorkspaces = searchTerm
        ? workspaceList.filter(workspace => 
            workspace?.messages[0]?.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : workspaceList;

    // Format date for display
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Truncate content for display
    const truncateText = (text, maxLength = 30) => {
        if (!text) return "New conversation";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-1 py-2 mb-3">
                <h2 className="font-semibold text-lg">Your Conversations</h2>
                <button 
                    onClick={GetAllWorkspace}
                    className="p-1 ml-auto text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
                    aria-label="Refresh conversations"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
            
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            <Link 
                href="/" 
                className="flex items-center gap-2 p-2 mb-3 border border-gray-800 rounded-md hover:border-blue-500/50 hover:bg-blue-900/10 transition-all group"
            >
                <Plus size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-blue-300">New Conversation</span>
            </Link>
            
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <div className="flex items-center justify-center py-6 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Loading conversations...</span>
                    </div>
                ) : filteredWorkspaces.length > 0 ? (
                    <div className="space-y-1">
                        {filteredWorkspaces.map((workspace) => {
                            const isActive = pathname === `/workspace/${workspace?._id}`;
                            return (
                                <Link 
                                    href={`/workspace/${workspace?._id}`} 
                                    key={workspace._id}
                                    onClick={toggleSidebar}
                                >
                                    <div 
                                        className={`
                                            rounded-md p-2 transition-all cursor-pointer flex items-start gap-2
                                            ${isActive 
                                                ? 'bg-blue-900/30 border-blue-500 text-white border' 
                                                : 'hover:bg-gray-800 text-gray-400 hover:text-white'}
                                        `}
                                    >
                                        <MessageSquare size={16} className={`mt-1 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {truncateText(workspace?.messages[0]?.content)}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs opacity-70">
                                                    {formatDate(workspace?._creationTime)}
                                                </span>
                                                <span className="text-xs opacity-70">
                                                    {workspace?.messages?.length || 0} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-gray-500">
                        <FileText className="h-10 w-10 mb-2 opacity-30" />
                        {searchTerm ? (
                            <>
                                <p className="font-medium">No matching conversations</p>
                                <p className="text-sm mt-1">Try a different search term</p>
                            </>
                        ) : (
                            <>
                                <p className="font-medium">No conversations yet</p>
                                <p className="text-sm mt-1">Start a new conversation to get help</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkspaceHistory;
