import { router, publicProcedure,  protectedAdmin } from "../trpc";
import { signUpSchema } from "../../common/Validation/auth";
import {  TRPCError } from "@trpc/server";
import { hash } from "argon2";

export const customRouter =  router({
    signup: publicProcedure.input(signUpSchema).mutation(async ({ input, ctx }) => {
      const { username, email, password } = input;

      const exists = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const hashedPassword = await hash(password);

      const result = await ctx.prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.email,
      };
    }),

    secret:protectedAdmin.query(async ({ ctx }) => {

      const user = await ctx.prisma.user.findMany()

      return user
    })
  });

