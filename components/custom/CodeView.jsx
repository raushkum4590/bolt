"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "@/app/data/Lookup";
import axios from "axios";
import { MessagesContext } from "@/context/MessagesContext";
import Prompt from "@/app/data/Prompt";
import { Code, Code2, Globe, Loader2, Sparkles } from "lucide-react";

function CodeView() {
  
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const {messages, setMessages} = useContext(MessagesContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  

  useEffect(() => {
    if(messages?.length > 0) {
      const role = messages[messages?.length-1].role;
      if(role == 'user') {
        GenerateAiCode();
      }
    }
  }, [messages]);

  const GenerateAiCode = async() => {
    setIsGenerating(true);
    setCodeGenerated(false);
    
    try {
      const PROMPT = JSON.stringify(messages) + " " + Prompt.CODE_GEN_PROMPT;
      const result = await axios.post('/api/gen-ai-code', {
        prompt: PROMPT
      });
      
      console.log(result.data);
      const aiResp = result.data;
      
      // Check if we have valid data before proceeding
      if (!aiResp || !aiResp.files) {
        console.error("Invalid response data:", aiResp);
        throw new Error("Invalid response format from API");
      }
      
      // Create animation effect by adding files one by one with delay
      const mergedFiles = {...Lookup.DEFAULT_FILE};
      setFiles(mergedFiles);
      
      setTimeout(() => {
        setFiles(prevFiles => ({...prevFiles, ...aiResp?.files}));
        setCodeGenerated(true);
        
        // Add sparkle animation effect after code generation
        setTimeout(() => {
          setCodeGenerated(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Error generating code:", error);
      // Display error to user (you could add a toast notification here)
      alert(`Error generating code: ${error.message || "Unknown error"}`);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    }
  }

  return (
    <div className="relative">
      {/* Code Generation Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="border-4 border-t-blue-500 border-r-blue-400 border-b-blue-600 border-l-purple-500 rounded-full w-16 h-16 animate-spin" />
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-blue-400 animate-pulse">Generating Code</h3>
              <p className="text-sm text-gray-400 mt-2">Creating components and logic...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sparkle Animation Overlay */}
      {codeGenerated && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 animate-ping duration-700">
            <Sparkles className="text-yellow-400 h-8 w-8" />
          </div>
          <div className="absolute top-1/3 right-1/3 animate-ping duration-1000 delay-300">
            <Sparkles className="text-blue-400 h-6 w-6" />
          </div>
          <div className="absolute bottom-1/3 left-1/2 animate-ping duration-700 delay-500">
            <Sparkles className="text-purple-400 h-7 w-7" />
          </div>
        </div>
      )}
      
      <div className="bg-[#181818] w-full p-2 border rounded-xl shadow-lg transition-all duration-300">
        {/* Header with animation */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 mb-3">
          <div className="flex items-center gap-2">
            <Code2 className={`h-5 w-5 text-blue-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <h2 className="font-medium text-gray-200">Code Editor</h2>
          </div>
          
          {/* Tab Selector with improved styling */}
          <div className="flex items-center flex-wrap shrink-0 bg-black/70 p-1.5 gap-1 justify-center rounded-full border border-gray-800 shadow-inner">
            <button
              onClick={() => setActiveTab("code")}
              className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === "code"
                  ? "text-blue-400 bg-blue-500/20 border border-blue-500/30 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Code
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                activeTab === "preview"
                  ? "text-blue-400 bg-blue-500/20 border border-blue-500/30 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
        </div>

        {/* Sandpack Content with animation */}
        <div className={`transition-all duration-500 ${isGenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          <SandpackProvider 
            files={files}
            template="react" 
            theme="dark"
            customSetup={{
              dependencies:{
                ...Lookup.DEPENDANCY
              }
            }}
            options={{
              externalResources:['https://unpkg.com/@tailwindcss/browser@4']
            }}
          >
            <SandpackLayout className="animate-in fade-in duration-500 slide-in-from-bottom-5">
              <SandpackFileExplorer 
                style={{ height: "80vh" }} 
              />
              {/* Conditional Rendering for Tabs with transition */}
              <div className="relative flex-grow">
                {activeTab === "code" && (
                  <div className="absolute inset-0 animate-in fade-in duration-300">
                    <SandpackCodeEditor style={{ height: "80vh" }} />
                  </div>
                )}
                {activeTab === "preview" && (
                  <div className="absolute inset-0 animate-in fade-in duration-300 slide-in-from-right-3">
                    <SandpackPreview showNavigator={true} style={{ height: "80vh" }} />
                  </div>
                )}
              </div>
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}

export default CodeView;
