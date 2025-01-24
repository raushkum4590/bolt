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


function CodeView() {
  
  const [activeTab, setActiveTab] = useState("code");
  const [files,setFiles]=useState(Lookup?.DEFAULT_FILE)
  const {messages,setMessages} = useContext(MessagesContext);
  

  useEffect(()=>{
          if(messages?.length>0)
          {
              const role =messages[messages?.length-1].role;
              if(role=='user')
              {
                  GenerateAiCode();
              }
          }
  
      },[messages])

  const GenerateAiCode=async()=>{
    const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
    const result=await axios.post('/api/gen-ai-code',{
      prompt:PROMPT
    });
    console.log(result.data);
    const aiResp=result.data;
    const mergedFiles={...Lookup.DEFAULT_FILE,...aiResp?.files}
    setFiles(mergedFiles);
   
  }

  return (
    <div>
      <div className="bg-[#181818] w-full p-2 border">
        {/* Tab Selector */}
        <div className="flex items-center flex-wrap shrink-0 bg-black p-1 w-[140px] gap-3 justify-center rounded-full">
          <h2
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer ${
              activeTab === "code"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300"
            }`}
          >
            Code
          </h2>
          <h2
            onClick={() => setActiveTab("preview")}
            className={`text-sm cursor-pointer ${
              activeTab === "preview"
                ? "text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full"
                : "text-gray-300"
            }`}
          >
            Preview
          </h2>
        </div>

        {/* Sandpack Content */}
        <SandpackProvider 
        files={files}
        template="react" theme="dark"
        customSetup={{
          dependencies:{
            ...Lookup.DEPENDANCY
          }
        }}
        options={{
          externalResources:['https://unpkg.com/@tailwindcss/browser@4']
        }}
        >
          <SandpackLayout>
            <SandpackFileExplorer style={{ height: "80vh" }} />
            {/* Conditional Rendering for Tabs */}
            {activeTab === "code" && (
              <SandpackCodeEditor style={{ height: "80vh" }} />
            )}
            {activeTab === "preview" && (
              <SandpackPreview showNavigator={true} style={{ height: "80vh" }} />
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}

export default CodeView;
