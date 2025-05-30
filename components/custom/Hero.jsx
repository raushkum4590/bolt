"use client";
import Colors from "@/app/data/Colors";
import Lookup from "@/app/data/Lookup";
import { MessagesContext } from "@/context/MessagesContext";

import { ArrowRight, Link, Loader2, ShieldCheck } from "lucide-react";
import React, { useContext, useState, useEffect } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { UserDetailContext } from '@/context/UserDetailContext'
import { useIsMobile } from "@/hooks/use-mobile";

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
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);  const router = useRouter();
  const isMobile = useIsMobile();
  const [userEmail, setUserEmail] = useState(null);
  const convex = useConvex();
  const userData = useQuery(
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
  
  // Check for existing user when component mounts or when userDetail changes
  useEffect(() => {
    // If userDetail is already set with an ID, we're already authenticated
    if (userDetail && userDetail._id) {
      // Close the dialog if it's open
      if (openDialog) {
        setOpenDialog(false);
      }
    }
  }, [userDetail, openDialog]);
  
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
    
    // Only show the dialog if the user is not authenticated after trying to fetch details
    if (!currentUserDetail || !currentUserDetail._id) {
      // Check if dialog is not already open to prevent multiple instances
      if (!openDialog) {
        setOpenDialog(true);
      }
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Main gradient orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-r from-blue-600/20 to-cyan-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-gradient-to-r from-blue-400/10 to-cyan-300/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-[30%] left-[15%] w-24 h-24 bg-gradient-to-r from-purple-400/10 to-pink-300/10 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      </div>

      {/* Enhanced noise texture */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-purple-500/5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 md:gap-8 lg:gap-12 w-full text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm animate-fadeInUp">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Next-Generation AI Web Builder
            </span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 max-w-5xl">
            <h1 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight animate-fadeInUp delay-200">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Build Stunning
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                Websites Instantly
              </span>
            </h1>
            
            <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp delay-400">
              Transform your wildest ideas into pixel-perfect websites in seconds. 
              <span className="text-white font-medium"> Just describe, and watch the magic happen.</span>
            </p>
          </div>

          {/* Modern Input Section */}
          <div className="w-full max-w-4xl mt-8 animate-fadeInUp delay-600">
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-1000 group-hover:duration-300 animate-pulse"></div>
              
              <div className="relative bg-gray-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col gap-6">
                  {/* Input area */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                    <div className="relative flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ✨ Describe your dream website
                      </label>
                      <textarea
                        value={userInput || ''}
                        placeholder="Create a modern restaurant website with online ordering, dark theme, and beautiful food gallery..."
                        onChange={(event) => setUserInput(event.target.value)}
                        className="w-full h-36 bg-gray-800/50 border border-gray-600/50 rounded-2xl p-6 text-white placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg leading-relaxed"
                      />
                      
                      {/* Input hints */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-gray-500 text-sm">
                        <Link className="h-4 w-4" />
                        <span>Be detailed for better results</span>
                      </div>
                    </div>
                    
                    {/* Generate button */}
                    {userInput && (
                      <button 
                        onClick={() => onGenerate(userInput)}
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 group relative overflow-hidden"
                        aria-label="Generate website"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <ArrowRight className="h-8 w-8 text-white group-hover:translate-x-1 transition-transform relative z-10" />
                      </button>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>AI is ready to create magic</span>
                    </div>
                    <div className="text-gray-500">
                      💡 The more details, the better the result
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Modern Suggestions */}
          <div className="w-full max-w-5xl animate-fadeInUp delay-800">
            <div className="text-center mb-8">
              <h3 className="text-gray-400 text-lg font-medium mb-4">
                🚀 Popular Ideas to Get You Started
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Lookup.SUGGSTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onGenerate(suggestion)}
                  className="group relative p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/40 hover:from-gray-700/60 hover:to-gray-800/60 border border-gray-700/30 hover:border-blue-500/50 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-xl backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 hover:from-blue-500/5 hover:to-purple-500/5 rounded-2xl transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                      {suggestion}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      Click to try this idea →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="w-full max-w-6xl mt-20 animate-fadeInUp delay-1000">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose Our AI Builder?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Experience the future of web development with cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎨",
                  title: "Pixel-Perfect Designs",
                  description: "Create stunning, responsive websites that look amazing on every device and screen size",
                  gradient: "from-blue-500/10 to-cyan-500/10",
                  border: "border-blue-500/20"
                },
                {
                  icon: "⚡",
                  title: "Lightning Speed",
                  description: "Generate complete, production-ready websites in seconds, not days or weeks",
                  gradient: "from-purple-500/10 to-pink-500/10",
                  border: "border-purple-500/20"
                },
                {
                  icon: "🧠",
                  title: "Smart AI Engine",
                  description: "Advanced AI that understands context, design principles, and modern web standards",
                  gradient: "from-green-500/10 to-emerald-500/10",
                  border: "border-green-500/20"
                }
              ].map((feature, index) => (
                <div key={index} className={`group relative p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border ${feature.border} rounded-3xl hover:border-opacity-40 transition-all duration-500 hover:transform hover:scale-105`}>
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-white font-bold text-xl mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 rounded-3xl transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="w-full max-w-4xl mt-16 animate-fadeInUp delay-1200">
            <div className="text-center p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl backdrop-blur-sm">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of creators who are already building stunning websites with our AI platform
              </p>
              <button
                onClick={() => document.querySelector('textarea').focus()}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
          {/* Enhanced CAPTCHA verification experience */}
        {showCaptcha && (
          <div className={`fixed inset-0 bg-gradient-to-br from-slate-950/95 via-gray-900/95 to-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 min-h-screen w-full captcha-wrapper ${captchaAnimation}`}>
            {/* Background effects for captcha */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center">
              {/* Security icon */}
              <div className="flex items-center justify-center mb-8 text-blue-400">
                <div className="relative">
                  <ShieldCheck className={`h-20 w-20 ${verifySucess ? 'text-green-400 success-verification' : 'text-blue-400'} transition-all duration-500`} />
                  {verifySucess && (
                    <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Security Verification
                </span>
              </h2>
              
              {/* Main verification card */}
              <div className="w-full">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl w-full mb-8 transition-all duration-300">
                  <p className="text-gray-300 mb-10 text-center text-lg leading-relaxed">
                    Please complete the verification below to continue. 
                    <span className="block mt-2 text-gray-400">
                      This helps us maintain a secure and high-quality service.
                    </span>
                  </p>
                  
                  {/* Verification button area */}
                  <div className="flex justify-center mb-8 relative min-h-[120px] items-center">
                    {loadingCaptcha && !verifySucess && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10 transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
                          <p className="text-blue-400 font-medium">Verifying your request...</p>
                        </div>
                      </div>
                    )}                    
                    
                    {verifySucess && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10 transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-green-500/20 p-4 pulse-animation mb-4">
                            <ShieldCheck className="h-12 w-12 text-green-400" />
                          </div>
                          <p className="text-green-400 font-semibold text-lg">Verification Successful!</p>
                          <p className="text-green-300 text-sm mt-1">Redirecting you now...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center w-full">
                      <button
                        onClick={() => onCaptchaChange(true)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 font-medium text-lg"
                      >
                        ✓ I'm not a robot
                      </button>
                      <p className="text-gray-500 text-sm mt-3">Click to verify your identity</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setCaptchaAnimation('fade-out');
                      setTimeout(() => setShowCaptcha(false), 600);
                    }}
                    className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-2xl text-gray-300 hover:text-white hover:from-gray-600/60 hover:to-gray-700/60 transition-all duration-300 font-medium backdrop-blur-sm"
                  >
                    Cancel Verification
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center max-w-md mx-auto leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors underline">
                    Terms of Service
                  </a>.
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
