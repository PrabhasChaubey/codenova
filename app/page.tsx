"use client"
import UserButton from "@/features/auth/components/user-button";
import { Button } from "@base-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-rose-500">Home</h1>
      <UserButton/>
    </div>
  );
}
