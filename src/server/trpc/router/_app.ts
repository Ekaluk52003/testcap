import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { customRouter } from "./custom";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  custom: customRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
