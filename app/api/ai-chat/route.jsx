import { chatSession } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req){
    const{prompt}=await req.json();
    try{
        const result = await chatSession.sendMessage(prompt);
        const AiResp=result.response.text();
        return NextResponse.json({result:AiResp});

    }catch(e){
        return NextResponse.error({error:e});

    }

}