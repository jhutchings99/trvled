"use client";
import Image from "next/image";
import Logo from "../../public/logo.svg";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  function onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function registerUser() {
    fetch(`${backendUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((res) => {
        res.json().then((data) => {
          //   successfully registered takes you to login page
          router.push("/");
        });
      })
      .catch((err) => {
        console.error(err);
      });
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
        <h1 className="text-3xl font-medium pl-8 pb-4">Register</h1>

        {/* INPUTS */}
        <div className="flex flex-col gap-3 items-center justify-center px-8">
          <input
            type="text"
            placeholder="Username"
            className="border-[2px] border-secondary rounded-md w-full p-2"
            onChange={onUsernameChange}
          />
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
          <Link href="/" className="pb-2 hover:underline hover:cursor-pointer">
            Already have an account? Login here
          </Link>
          <button
            className="bg-primary text-white py-2 px-4 rounded-full"
            onClick={() => {
              registerUser();
            }}
          >
            Register
          </button>
        </div>
      </div>
    </main>
  );
}
