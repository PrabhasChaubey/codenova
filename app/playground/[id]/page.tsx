"use client";

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@base-ui/react';
import { useParams } from 'next/navigation';
import React from 'react'

const Page = () => {
    const{id}=useParams<{id:string}>();

  return (
    <TooltipProvider>
        <>
        {/* todo: template tree*/}

        <SidebarInset>
            <header>
                <SidebarTrigger/>
                <Separator/>

                <div>
                    <div>

                    </div>
                </div>

            </header>
        </SidebarInset>
        </>
    </TooltipProvider>
    
  )
}

export default Page