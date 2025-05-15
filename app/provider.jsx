"use client"
import React, { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"

import Header from '@/components/custom/Header'
import { MessagesContext } from '@/context/MessagesContext'
import { UserDetailContext } from '@/context/UserDetailContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSideBar from '@/components/custom/AppSideBar'
import { usePathname } from 'next/navigation'

function Provider({children}) {
    const [messages,setMessages]=useState([]);
    const [userDetail,setUserDetail]=useState(null);
    const convex=useConvex();
    const pathname = usePathname();
    
    // Check if current path is a workspace path
    const isWorkspacePath = pathname?.includes('/workspace/');

    useEffect(()=> {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserDetail(parsedUser);
            }
        } catch (error) {
            console.error("Error retrieving user from localStorage:", error);
        }
    }, []);

    useEffect(()=> {
        IsAuthanticated();
    }, []);

    const IsAuthanticated = async () => {
        if(typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.email) {
                const result = await convex.query(api.users.GetUser, {email: user.email});
                setUserDetail(result);
                console.log(result);
            }
        }
    }
  return (
    <div>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}>
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
        <MessagesContext.Provider value={{messages,setMessages}}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            
            <SidebarProvider defaultOpen={isWorkspacePath}> 
              {isWorkspacePath && <AppSideBar/>}
        {children}
        </SidebarProvider>
        </NextThemesProvider>
        </MessagesContext.Provider>
        </UserDetailContext.Provider>
        </GoogleOAuthProvider>
    </div>
  )
}

export default Provider