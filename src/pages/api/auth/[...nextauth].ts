import NextAuth, { type NextAuthOptions } from "next-auth";
// Prisma adapter for NextAuth, optional and can be removed
import Credentials from "next-auth/providers/credentials";
import { verify } from "argon2";

import { prisma } from "../../../server/db/client";
import { loginSchema } from "../../../server/common/Validation/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);

          const result = await prisma.user.findFirst({
            where: { email },
          });

          if (!result) return null;

          const isValidPassword = await verify(result.password, password);

          if (!isValidPassword) return null;

          return { id: result.id, email, username: result.username, role: result.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
         //@ts-ignore
        token.username = user.username;
          //@ts-ignore
        token.role = user.role
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
          //@ts-ignore
        session.user.userId = token.userId;
          //@ts-ignore
        session.user.email = token.email;
          //@ts-ignore
        session.user.username = token.username;
          //@ts-ignore
        session.user.role = token.role;
      }

      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  pages: {
    signIn: "/",
    newUser: "/sign-up",
  },
  secret: "super-secret",
}

export default NextAuth(authOptions);
