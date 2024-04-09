"use client";

import Navbar from "../components/Navbar/Navbar";
import SocialFeed from "../components/SocialFeed/SocialFeed";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import WhoToFollow from "../components/WhoToFollow/WhoToFollow";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
    }
  });

  return (
    <main className="flex justify-center">
      <Navbar />
      <SocialFeed />
      <WhoToFollow />
    </main>
  );
}
