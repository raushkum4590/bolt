import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "./CustomSidebar"
import Image from "next/image"
import React from 'react'
import { Button } from "../ui/button"
import { MessageCircleCode } from "lucide-react"
import WorkspaceHistory from "./WorkspaceHistory"
import SideBarFooter from "./SideBarFooter"

function AppSideBar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-5" />
      <Image src={'/logo.svg'} alt="logo" width={40} height={40} />
      <SidebarContent className="p-5">
        <Button><MessageCircleCode/>Start New Chat</Button>
        <SidebarGroup >
            <WorkspaceHistory/>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter >
        <SideBarFooter/>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSideBar