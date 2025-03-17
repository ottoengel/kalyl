import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import { db } from "./prisma"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
//import { EmailProvider } from "next-auth/providers/email"


import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt", // Garante que a sessão use JWT
    maxAge: 30 * 24 * 60 * 60, // Sessão dura 30 dias
    updateAge: 24 * 60 * 60, // Atualiza o token a cada 24h
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("Tentando autenticar:", credentials)
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios!")
        }
        console.log("Buscando usuário no banco...")
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, name: true, email: true, password: true, role: true }
        })
     
        if (!user?.password) {
          console.error("Usuário não encontrado:", credentials.email)
          throw new Error("Usuário não encontrado!")
        }

        console.log({ id: user.id, name: user.name, email: user.email, role: user.role })
     
        console.log("Usuário autenticado com sucesso!");

        return { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("🟢 Sessão ativa:", session);
      
      session.user = {
        ...session.user,
        id: token.id,  
        role: token.role, 
      }
    
      return session;
    },  
  },
  secret: process.env.NEXTAUTH_SECRET,
}
