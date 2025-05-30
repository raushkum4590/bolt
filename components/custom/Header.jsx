"use client"
import Image from 'next/image'
import React, { useState, useEffect, useContext } from 'react'
import { Button } from '../ui/button'
import Colors from '@/app/data/Colors'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import SignInDialog from './SignInDialog'
import { UserDetailContext } from '@/context/UserDetailContext'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenSignInDialog = () => {
    setShowSignInDialog(true);
    // Close mobile menu if it's open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  const handleSignOut = () => {
    // Clear user data from context and localStorage
    setUserDetail(null);
    localStorage.removeItem('user');
    setProfileMenuOpen(false);
  };


  // Close profile menu when clicking outside
  useEffect(() => {
    if (profileMenuOpen) {
      const closeMenu = () => setProfileMenuOpen(false);
      document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
    }
  }, [profileMenuOpen]);

  return (
    <>      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'backdrop-blur-xl bg-gray-900/95 shadow-2xl shadow-black/20 border-b border-gray-700/50' 
          : 'backdrop-blur-lg bg-gray-900/80 border-b border-gray-800/30'
      } before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5 before:pointer-events-none`}>        <div className='max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center relative z-10'>
          <Link href="/" className="flex items-center gap-3 transition-all hover:scale-105 duration-300 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
                <Image 
                  src="/logo.svg" 
                  alt="logo" 
                  width={24}
                  height={24}
                  className="object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" 
                  priority
                />
              </div>
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:from-blue-300 hover:via-purple-400 hover:to-pink-400 transition-all duration-300">
              AI Web Builder
            </span>
          </Link>            {/* Desktop navigation */}
          <nav className='hidden md:flex items-center gap-6'>
            {userDetail ? (<div className="relative">
                <button 
                  className="flex items-center gap-2 hover:bg-gray-800/70 py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-700/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                    <Image 
                      src={userDetail?.picture || "/logo.svg"} 
                      alt={userDetail?.name || "User"} 
                      width={32}
                      height={32}
                      className="rounded-full object-cover bg-gray-800"
                    />
                  </div>
                  <span className="font-medium text-sm hidden sm:inline bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">{userDetail?.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                  {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/20 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-1">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>            ) : (              <>
                <Button 
                  variant="ghost" 
                  className="hover:bg-gray-800/70 hover:text-blue-400 transition-all duration-300 text-gray-300 border border-gray-700/50 hover:border-blue-500/50 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
                  onClick={handleOpenSignInDialog}
                >
                  Sign In
                </Button>
                <Button 
                  className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border-0 relative overflow-hidden group'
                  onClick={handleOpenSignInDialog}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative">Get Started Free</span>
                </Button>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-800/70 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
          {/* Mobile navigation - moved outside to be full width with smooth transition */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 border-t border-gray-800/50 bg-black/90 ${
            mobileMenuOpen ? 'max-h-80 py-4 shadow-lg' : 'max-h-0'
          }`}
        >          <div className="flex flex-col items-center gap-4 px-4">
            {userDetail ? (
              <>
                <div className="flex items-center gap-3 w-full p-2 bg-gray-800/50 rounded-lg">
                  <Image 
                    src={userDetail?.picture || "/logo.svg"} 
                    alt={userDetail?.name || "User"} 
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-blue-500"
                  />
                  <div>
                    <p className="font-medium text-sm">{userDetail?.name}</p>
                    <p className="text-xs text-gray-400">{userDetail?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-gray-800/70 hover:text-red-400 border border-gray-700"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-gray-800/70 hover:text-blue-400"
                  onClick={handleOpenSignInDialog}
                >
                  Sign In
                </Button>
                <Button 
                  className='w-full text-white shadow-md shadow-blue-500/20'
                  style={{
                    backgroundColor: Colors.BLUE
                  }}
                  onClick={handleOpenSignInDialog}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sign In Dialog */}
      <SignInDialog 
        openDialog={showSignInDialog} 
        closeDialog={() => setShowSignInDialog(false)} 
      />
    </>
  )
}

export default Header