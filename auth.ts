import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import { db } from "./lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  
})