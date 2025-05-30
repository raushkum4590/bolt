"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

// Sidebar Context
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Sidebar Provider
export const SidebarProvider = ({ children, defaultOpen = false, className, ...props }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const openSidebar = () => {
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const value = {
    isOpen,
    isMobile,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    state: isOpen ? 'expanded' : 'collapsed',
    openMobile: isOpen,
    setOpenMobile: setIsOpen
  };

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn("flex h-screen w-full", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

// Sidebar Component
export const Sidebar = ({ children, className, ...props }) => {
  const { isOpen, isMobile } = useSidebar();

  return (
    <>      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn" 
          onClick={() => {}} 
        />
      )}
        {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform transition-all duration-300 ease-in-out",
          "bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50",
          "shadow-2xl shadow-purple-500/10",
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : (isOpen ? "translate-x-0" : "-translate-x-64"),
          "lg:relative lg:translate-x-0",
          !isOpen && !isMobile && "lg:w-0 lg:overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="flex h-full flex-col">
          {children}
        </div>
      </div>
    </>
  );
};

// Sidebar Header
export const SidebarHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b border-gray-800/50",
      "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
      "backdrop-blur-sm",
      className
    )} {...props}>
      {children}
    </div>
  );
};

// Sidebar Content
export const SidebarContent = ({ children, className, ...props }) => {
  return (
    <div className={cn(
      "flex-1 overflow-y-auto p-4",
      "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
      "hover:scrollbar-thumb-gray-600",
      className
    )} {...props}>
      {children}
    </div>
  );
};

// Sidebar Footer
export const SidebarFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn(
      "p-4 border-t border-gray-800/50",
      "bg-gradient-to-r from-blue-500/5 to-purple-500/5",
      "backdrop-blur-sm",
      className
    )} {...props}>
      {children}
    </div>
  );
};

// Sidebar Group
export const SidebarGroup = ({ children, className, ...props }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

// Sidebar Toggle Button
export const SidebarTrigger = ({ className, ...props }) => {
  const { toggleSidebar, isOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-200",
        "hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/25",
        "border border-gray-700/50 hover:border-purple-500/50",
        "backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>
  );
};

// Main content area that adjusts for sidebar
export const SidebarInset = ({ children, className, ...props }) => {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        !isMobile && isOpen && "lg:ml-64",
        !isMobile && !isOpen && "lg:ml-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
