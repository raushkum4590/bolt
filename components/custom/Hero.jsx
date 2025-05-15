"use client";
import Colors from "@/app/data/Colors";
import Lookup from "@/app/data/Lookup";
import { MessagesContext } from "@/context/MessagesContext";

import { ArrowRight, Link, Loader2, ShieldCheck } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { UserDetailContext } from '@/context/UserDetailContext'
import { useIsMobile } from "@/hooks/use-mobile";
import ReCAPTCHA from "react-google-recaptcha";

function Hero() {
  const [userInput, setUserInput] = useState();
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [captchaAnimation, setCaptchaAnimation] = useState('');
  const [verifySucess, setVerifySuccess] = useState(false);
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userEmail, setUserEmail] = useState(null);
  const convex = useQuery(
    api.users.GetUser,
    userEmail ? { email: userEmail } : "skip"
  );
  
  // Load email from local storage on component mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
          setUserEmail(parsedUser.email);
        }
      }
    } catch (error) {
      console.error("Error retrieving user email from localStorage:", error);
    }
  }, []);
  
  // Check if user session has verified captcha
  useEffect(() => {
    const captchaStatus = sessionStorage.getItem('captchaVerified');
    if (captchaStatus === 'true') {
      setCaptchaVerified(true);
    }
  }, []);
  
  const onCaptchaChange = (value) => {
    if (value) {
      setLoadingCaptcha(true);
      
      // Show verification success animation
      setTimeout(() => {
        setVerifySuccess(true);
        
        // Add a small delay to show success animation before proceeding
        setTimeout(() => {
          setCaptchaVerified(true);
          
          // Start fade-out animation 
          setCaptchaAnimation('fade-out');
          
          // Wait for animation to complete before hiding
          setTimeout(() => {
            setShowCaptcha(false);
            setLoadingCaptcha(false);
            setVerifySuccess(false);
            setCaptchaAnimation('');
            // Store verification in session storage for this session
            sessionStorage.setItem('captchaVerified', 'true');
            
            // Continue with the original input if there was one waiting
            if (userInput) {
              onGenerateAfterVerification(userInput);
            }
          }, 600);
        }, 800);
      }, 500);
    }
  };
  
  const onGenerateAfterVerification = async (input) => {
    let currentUserDetail = userDetail;
    
    if (!currentUserDetail || !currentUserDetail._id) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Found user in localStorage, retrieving from Convex");
          
          // Get user details from Convex database using email
          if (parsedUser && parsedUser.email) {
            try {
              const convexUser = await convex.query(api.users.GetUser, {
                email: parsedUser.email
              });
              
              if (convexUser) {
                currentUserDetail = convexUser;
                // Update context for future use
                setUserDetail(convexUser);
              }
            } catch (convexError) {
              console.error("Failed to get user from Convex:", convexError);
            }
          }
        }
      } catch (error) {
        console.error("Error retrieving user from localStorage:", error);
      }
    }
    
    if (!currentUserDetail || !currentUserDetail._id) {
      setOpenDialog(true);
      return;
    }
  
    const msg = { role: "user", content: input };
    
    try {
      const workspaceId = await CreateWorkspace({
        user: currentUserDetail._id,
        messages: [msg],
      });
  
      setMessages([msg]);
  
      console.log(workspaceId);
      router.push("/workspace/" + workspaceId);
    } catch (error) {
      console.error("Workspace creation failed:", error);
    }
  };
  
  const onGenerate = async (input) => {
    if (!captchaVerified) {
      setShowCaptcha(true);
      return;
    }
    
    onGenerateAfterVerification(input);
  };
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full mx-auto px-4 md:px-6 ${isMobile ? 'pt-16' : 'md:pl-24 lg:pl-64 xl:pl-72'}`}>
      <div className="flex flex-col items-center gap-5 md:gap-6 w-full max-w-xl md:max-w-2xl lg:max-w-3xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-center">{Lookup.HERO_HEADING}</h2>
        <p className="text-gray-300 font-medium text-center max-w-sm md:max-w-lg">{Lookup.HERO_DESC}</p>
        <div className="p-3 sm:p-4 md:p-5 border border-gray-700 rounded-xl w-full shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/20 flex flex-col items-center"
         style={{ backgroundColor: Colors.BACKGROUND }}>
          <div className="flex gap-2 items-end w-full">
            <textarea
              placeholder={Lookup.INPUT_PLACEHOLDER}
              onChange={(event) => setUserInput(event.target.value)}
              className="outline-none bg-transparent w-full h-28 sm:h-32 max-h-56 resize-none focus:ring-1 focus:ring-blue-500/30 rounded p-2 transition-all duration-300"
            />
            {userInput && (
              <button 
                onClick={() => onGenerate(userInput)}
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center h-10 w-10 mb-1"
                aria-label="Generate content"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 text-xs w-full">
            <Link className="h-4 w-4" />
            <span>Paste a link or describe what you want to create</span>
          </div>
        </div>
        <div className="flex mt-3 md:mt-5 flex-wrap justify-center gap-2 md:gap-3 max-w-full">
          {Lookup.SUGGSTIONS.map((suggestion, index) => (
            <h2
              onClick={() => onGenerate(suggestion)}
              className="p-1.5 px-3 border border-gray-700 rounded-full text-xs sm:text-sm text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer transition-all duration-200"
              key={index}
            >
              {suggestion}
            </h2>
          ))}
        </div>
        
        {/* Full-page CAPTCHA verification experience */}
        {showCaptcha && (
          <div className={`fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center z-50 min-h-screen w-full captcha-wrapper ${captchaAnimation}`}>
            <div className="w-full max-w-4xl mx-auto px-4 md:px-8 flex flex-col items-center">
              <div className="flex items-center justify-center mb-6 text-blue-500">
                <ShieldCheck className={`h-12 w-12 md:h-16 md:w-16 ${verifySucess ? 'success-verification' : ''}`} />
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Security Verification Required
              </h2>
              
              <div className="w-full max-w-xl">
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full mb-8 transition-all duration-300">
                  <p className="text-gray-300 mb-8 text-center md:text-lg">
                    Please complete the verification below to continue. This helps us protect our service from automated bots.
                  </p>
                  
                  <div className="flex justify-center mb-6 relative">
                    {loadingCaptcha && !verifySucess && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-md z-10 transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
                          <p className="text-blue-400">Verifying...</p>
                        </div>
                      </div>
                    )}
                    
                    {verifySucess && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-md z-10 transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-green-500 bg-opacity-20 p-3 pulse-animation">
                            <ShieldCheck className="h-10 w-10 text-green-500 mb-1" />
                          </div>
                          <p className="text-green-400 mt-3 font-medium">Verification Successful!</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="recaptcha-container transform scale-110 md:scale-125 lg:scale-150">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        onChange={onCaptchaChange}
                        theme="dark"
                        size="normal"
                        className="recaptcha-badge"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setCaptchaAnimation('fade-out');
                      setTimeout(() => setShowCaptcha(false), 600);
                    }}
                    className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium flex items-center justify-center"
                  >
                    Cancel Verification
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center max-w-md mx-auto">
                  This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">Terms of Service</a> apply.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <SignInDialog
          openDialog={openDialog}
          closeDialog={(v) => setOpenDialog(v)}
        />{" "}
      </div>
    </div>
  );
}
export default Hero;
