import  {Footer}  from "@/features/home/components/footer";
import  {Header}  from "@/features/home/components/header";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
// import { usePathname } from "next/navigation";

export const metadata: Metadata = {
    title: {
        template: "CodeNova",
        default: "A Web based AI Code Editor",
    },
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <div
        className={cn(
          "absolute inset-0",
          "bg-size-[40px_40px]",
          "[background-image:linear-gradient(to right,#e4e4e7 1px,transparent 1px),linear-gradient(to bottom,#e4e4e7 1px,transparent 1px)]",
          "dark:[background-image: linear-gradient(to right,#262626 1px,transparent 1px),linear-gradient(to bottom,#262626 1px,transparent 1px)]",
        )}
      />
       <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"/>
      
            <main className="z-20 relative w-full pt-0 md:pt-0  ">
          
                {children}
            </main>
            <Footer />
        </>
    );
}