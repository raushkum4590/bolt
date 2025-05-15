"use client"
import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Lookup from '@/app/data/Lookup';
import { Button } from '../ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import uuid4 from 'uuid4';
import { AlertCircle, Loader2 } from 'lucide-react';

function SignInDialog({ openDialog, closeDialog }) {
    const {userDetail, setUserDetail} = useContext(UserDetailContext);
    const CreateUser = useMutation(api.users.CreateUser);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse?.access_token}` } },
                );
                
                const user = userInfo.data;
                await CreateUser({
                    name: user?.name,
                    email: user?.email,
                    picture: user?.picture,
                    uid: uuid4()
                });
                
                if(typeof window !== 'undefined'){
                    localStorage.setItem('user', JSON.stringify(user));
                }
                
                setUserDetail(user);
                closeDialog(false);
            } catch (err) {
                console.error("Login error:", err);
                setError("Failed to sign in. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: errorResponse => {
            console.error("Google OAuth error:", errorResponse);
            setError("Authentication failed. Please try again.");
            setIsLoading(false);
        },
    });

    return (
        <Dialog open={openDialog} onOpenChange={closeDialog}>
            <DialogContent className="sm:max-w-md border border-gray-700 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        {Lookup.SIGNIN_HEADING}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 mt-4">
                    <p className="mt-2 text-center text-gray-300">{Lookup.SIGNIN_SUBHEADING}</p>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-md w-full">
                            <AlertCircle size={16} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    
                    <Button 
                        className="bg-blue-600 text-white hover:bg-blue-500 mt-3 w-full transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={googleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path 
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                                        fill="#4285F4" 
                                    />
                                    <path 
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                                        fill="#34A853" 
                                    />
                                    <path 
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                                        fill="#FBBC05" 
                                    />
                                    <path 
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                                        fill="#EA4335" 
                                    />
                                </svg>
                                Sign In With Google
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-gray-400 text-center">{Lookup.SIGNIn_AGREEMENT_TEXT}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SignInDialog;
