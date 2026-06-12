"use client";

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { TooltipProvider } from '@base-ui/react';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { TemplateFileTree } from '@/features/playground/components/template-file-tree';
import { useFileExplorer } from '@/features/playground/hooks/useFileExplorer';

const Page = () => {
    const{id}=useParams<{id:string}>();
    const {playgroundData,templateData,isLoading,error,saveTemplateData}= usePlayground(id);

    const {
        activeFileId,
        closeAllFiles,
        openFile,
        closeFile,
        editorContent,
        updateFileContent,
        handleAddFile,
        handleAddFolder,
        handleDeleteFile,
        handleDeleteFolder,
        handleRenameFile,
        handleRenameFolder,
        openFiles,
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        setOpenFiles,
    } = useFileExplorer();

    //Create wrapper functions that pass saveTemplateData
   

  return (
    <div>
        <>
        <TemplateFileTree data={templateData!}/>

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