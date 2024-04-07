"use client";

import Navbar from "../components/Navbar/Navbar";
import SocialFeed from "../components/SocialFeed/SocialFeed";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

  return (
    <main className="flex px-52">
      <Navbar />
      <SocialFeed />
    </main>
  );
}
