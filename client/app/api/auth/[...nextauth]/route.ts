import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        //console.log("Credentials", credentials);
        // Add logic here to look up the user from the credentials supplied
        //const res = await fetch("http://localhost:8080/users/login", {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );
        const user = await res.json();
        //console.log("User", user);

        if (user?.id) {
          // Any object returned will be saved in `user` property of the JWT
          // console.log("User found", user);
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (trigger === "update") {
        const backendResponse = await fetch(
          // `http://localhost:8080/users/${token.id}`
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${token.id}`
        );
        const backendData = await backendResponse.json();
        // console.log("RES", backendData);

        return { ...token, ...backendData };
      }

      // console.log("JWT", token, user, session, trigger);

      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      session.user = token as any;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
