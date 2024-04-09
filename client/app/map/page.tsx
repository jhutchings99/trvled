"use client";

import Map from "../components/Map/Map";
import Navbar from "../components/Navbar/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function MapPage() {
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
      <Map />
    </main>
  );
}
