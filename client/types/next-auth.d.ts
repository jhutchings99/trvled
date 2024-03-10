import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: string;
      email: string;
      globalVisited: number[];
      id: number;
      usaVisited: number[];
      username: string;
    };
  }
}
