"use client";

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { TooltipProvider } from '@base-ui/react';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { TemplateFileTree } from '@/features/playground/components/template-file-tree';

const Page = () => {
    const{id}=useParams<{id:string}>();
    const {playgroundData,templateData,isLoading,error,saveTemplateData}= usePlayground(id)

  return (
    <div>
        <>
        {/* todo: template tree*/}
        {templateData && (
        <TemplateFileTree
          data={templateData}
        //   onFileSelect={handleFileSelect}
        //   selectedFile={activeFile}
        //   title="File Explorer"
        //   onAddFile={wrappedHandleAddFile}
        //   onAddFolder={wrappedHandleAddFolder}
        //   onDeleteFile={wrappedHandleDeleteFile}
        //   onDeleteFolder={wrappedHandleDeleteFolder}
        //   onRenameFile={wrappedHandleRenameFile}
        //   onRenameFolder={wrappedHandleRenameFolder}
        />
        )}

        <SidebarInset>
            <header className="felx h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1 "/>
                <Separator orientation="vertical" className="mr-2 h-4"/>

                <div className="flex flex-1 items-center gap-2">
                    <div className='flex flex-col flex-1'>
                        {playgroundData?.title || "Code Playground"}
                    </div>
                </div>

            </header>
        </SidebarInset>
        </>
    </div>
    
  )
}

export default Page