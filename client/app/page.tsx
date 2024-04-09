"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Logo from "../public/logo.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  function onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  // login user using next auth
  const loginUser = async () => {
    //console.log("Email before submitting:", email);
    //console.log("Password before submitting:", password);

    const result = await signIn("credentials", {
      redirect: false, // Handle success/failure in the component
      email,
      password,
    });

    if (result?.error) {
      router.push("/");
    } else {
      router.push("/home");
    }
  };

  if (session?.user) {
    router.push("/home");
    // return (
    //   <>
    //     <p>Signed in as {session.user.email}</p>
    //     <button onClick={() => signOut()}>Sign out</button>
    //   </>
    // );
  }

  return (
    <main className="h-[70vh] w-[30vw] mx-auto mt-24 shadow-xl">
      <div>
        {/* HEADER */}

        <div className="flex gap-2 items-center justify-center py-4">
          <Image src={Logo} alt="trvled logo" className="w-8" />
          <p className="text-primary font-black text-4xl">trveld</p>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-medium pl-8 pb-4">Login</h1>

        {/* INPUTS */}
        <div className="flex flex-col gap-3 items-center justify-center px-8">
          <input
            type="email"
            placeholder="Email"
            className="border-[2px] border-secondary rounded-md w-full p-2"
            onChange={onEmailChange}
          />
          <input
            type="password"
            placeholder="Password"
            className="border-[2px] border-secondary rounded-md w-full p-2"
            onChange={onPasswordChange}
          />
        </div>

        {/* SUBMIT */}
        <div className="flex flex-col pl-8 pt-12">
          <Link
            href="/register"
            className="pb-2 hover:underline hover:cursor-pointer"
          >
            Don&apos;t have an account? Register here
          </Link>
          <button
            className="bg-primary text-white py-2 px-4 rounded-full"
            onClick={() => {
              loginUser();
            }}
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
