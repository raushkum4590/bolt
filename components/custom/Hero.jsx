"use client";
import Colors from "@/app/data/Colors";
import Lookup from "@/app/data/Lookup";
import { MessagesContext } from "@/context/MessagesContext";

import { ArrowRight, Link } from "lucide-react";
import React, { useContext, useState } from "react";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { UserDetailContext } from '@/context/UserDetailContext'
function Hero() {
  const [userInput, setUserInput] = useState();
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();
  const onGenerate = async (input) => {
    // Add more robust checking
    if (!userDetail || !userDetail._id) {
      setOpenDialog(true);
      return;
    }
  
    const msg = { role: "user", content: input };
    
    try {
      const workspaceId = await CreateWorkspace({
        user: userDetail._id,  // Ensure this is passed
        messages: [msg],
      });
  
      // Update messages context
      setMessages( msg);
  
      console.log(workspaceId);
      router.push("/workspace/" + workspaceId);
    } catch (error) {
      console.error("Workspace creation failed:", error);
      // Optionally handle error (show toast, etc.)
    }
  };
  return (
    <div className="flex flex-col items-center mt-36 xl:mt-42 gap-2">
      <h2 className="font-bold text-4xl">{Lookup.HERO_HEADING}</h2>
      <p className="text-gray-300 font-medium">{Lookup.HERO_DESC}</p>
      <div className="p-5 border rounded-xl max-w-2xl w-full mt-0"
       style={{ backgroundColor: Colors.BACKGROUND }}>
        <div
          className="flex gap-2"
         
        >
          <textarea
            placeholder={Lookup.INPUT_PLACEHOLDER}
            onChange={(event) => setUserInput(event.target.value)}
            className="outline-none bg-transparent w-full h-32 max-h-56 resize-none "
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-blue-500 p-2 h-8 w-8 round-md cursor-pointer"
            />
          )}{" "}
        </div>
        <div>
          {" "}
          <Link className="h-5 w-5" />
        </div>
      </div>
      <div className="flex mt-5 flex-wrap max-w-2xl justify-center gap-3">
        {Lookup.SUGGSTIONS.map((suggestion, index) => (
          <h2
            onClick={() => onGenerate(suggestion)}
            className="p-1 px-2 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer"
            key={index}
          >
            {suggestion}
          </h2>
        ))}
      </div>
      <SignInDialog
        openDialog={openDialog}
        closeDialog={(v) => setOpenDialog(v)}
      />{" "}
    </div>
  );
}
export default Hero;
