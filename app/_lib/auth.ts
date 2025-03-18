import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { db } from "./prisma";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

async function getUserRole(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role; // Se o usuário não tiver um papel definido, assume "USER"
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
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
        console.log("Tentando autenticar:", credentials);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios!");
        }
        console.log("Buscando usuário no banco...");
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, name: true, email: true, password: true, role: true },
        });

        if (!user?.password) {
          console.error("Usuário não encontrado:", credentials.email);
          throw new Error("Usuário não encontrado!");
        }

        return { id: user.id, name: user.name, email: user.email, password: user.password, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (!token.role && token.sub) {
        token.role = await getUserRole(token.sub); // Buscar role do banco se não estiver no token
      }

      return token;
    },
    async session({ session, token }) {

      session.user = {
        ...session.user,
        id: token.sub || null,
        role: token.role || null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
