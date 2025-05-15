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
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-black/80 shadow-lg shadow-black/10' 
          : 'backdrop-blur-sm bg-black/50'
      } border-b border-gray-800/50`}>
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center'>
          <Link href="/" className="flex items-center gap-2 transition-all hover:scale-105 duration-300">
            <div className="relative h-10 w-10">
              <Image 
                src="/logo.svg" 
                alt="logo" 
                fill 
                className="object-contain drop-shadow-lg" 
                priority
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">AI Web</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className='hidden md:flex items-center gap-4'>
            {userDetail ? (
              <div className="relative">
                <button 
                  className="flex items-center gap-2 hover:bg-gray-800/70 py-2 px-3 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                >
                  <div className="relative h-8 w-8">
                    <Image 
                      src={userDetail?.picture || "/logo.svg"} 
                      alt={userDetail?.name || "User"} 
                      width={32}
                      height={32}
                      className="rounded-full object-cover border border-blue-500"
                    />
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">{userDetail?.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} />
                </button>
                
                {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hover:bg-gray-800/70 hover:text-blue-400 transition-colors"
                  onClick={handleOpenSignInDialog}
                >
                  Sign In
                </Button>
                <Button 
                  className='text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105'
                  style={{
                    backgroundColor: Colors.BLUE
                  }}
                  onClick={handleOpenSignInDialog}
                >
                  Get Started
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
            mobileMenuOpen ? 'max-h-60 py-4 shadow-lg' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col items-center gap-4 px-4">
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