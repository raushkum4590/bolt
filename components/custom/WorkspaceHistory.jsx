"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react'
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';

function WorkspaceHistory() {
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const convex = useConvex();
    const [workspaceList, setWorkspaceList] = useState([]);
    const{togglesidebar}=useSidebar();

    useEffect(() => {
        if (userDetail) {
            GetAllWorkspace();
        }
    }, [userDetail]);

    const GetAllWorkspace = async () => {
        const result = await convex.query(api.workspace.GetAllWorkspace, {
            userId: userDetail?._id,
        });
        setWorkspaceList(result);
        console.log(result);
    };

    return (
        <div className="font-medium text-lg">
            <h2>Your Chat</h2>
            <div>
                {workspaceList?.length > 0 ? (
                    workspaceList.map((workspace, index) => (
                        <Link href={'/workspace/'+workspace?._id} key={index} >
                        <h2
                        onClick={togglesidebar}
                         className='text-sm text-gray-400 mt-2 font-light hover:text-white cursor-pointer'>
                            {workspace?.messages[0]?.content || "No messages available"}
                        </h2>
                        </Link>
                    ))
                ) : (
                    <p>No workspaces available</p>
                )}
            </div>
        </div>
    );
}

export default WorkspaceHistory;
