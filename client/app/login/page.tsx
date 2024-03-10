"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import CreatePostForm from "../components/CreatePostForm/createPostForm";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Email before submitting:", email);
    console.log("Password before submitting:", password);

    const result = await signIn("credentials", {
      redirect: false, // Handle success/failure in the component
      email,
      password,
    });

    if (result && result.error) {
      // Handle login error (e.g., display error message)
      console.error("Login failed: ", result.error);
    } else {
      // Login successful! (redirect to protected page or similar)
      console.log("Login successful: ", result);
    }
  };

  if (session?.user) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signIn()}>Sign out</button>
        <CreatePostForm />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
