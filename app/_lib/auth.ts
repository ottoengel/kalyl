import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { db } from "./prisma";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

async function getUserSessionData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, image: true },
  });
  return user;
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
      // Se já existir conta com o mesmo e-mail (criada por senha), o login
      // Google vincula à mesma conta em vez de dar erro. O e-mail do Google
      // é verificado, então o vínculo é seguro.
      allowDangerousEmailAccountLinking: true,
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios!");
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            image: true,
          },
        });

        if (!user?.password) {
          // Sem cadastro por senha (conta só Google ou inexistente)
          return null;
        }

        const isBcryptHash = user.password.startsWith("$2");
        let passwordMatches: boolean;

        if (isBcryptHash) {
          passwordMatches = await bcrypt.compare(
            credentials.password,
            user.password,
          );
        } else {
          // Senha legada salva em texto puro: compara direto e, se bater,
          // migra para hash bcrypt.
          passwordMatches = user.password === credentials.password;
          if (passwordMatches) {
            const hashed = await bcrypt.hash(credentials.password, 10);
            await db.user.update({
              where: { id: user.id },
              data: { password: hashed },
            });
          }
        }

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          // Mantém o avatar (ex.: foto do Google) mesmo no login por senha
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.image) {
          token.picture = user.image;
        }
      } else if ((!token.role || !token.picture) && token.sub) {
        // Sessões antigas ou login por senha: completa role e foto pelo banco
        const dbUser = await getUserSessionData(token.sub);
        token.role = token.role || dbUser?.role;
        token.picture = token.picture || dbUser?.image || undefined;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub || null,
        role: token.role || null,
        image: (token.picture as string | undefined) ?? session.user?.image ?? null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
