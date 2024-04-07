"use client";

import Map from "../components/Map/Map";
import Navbar from "../components/Navbar/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MapPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

  return (
    <main className="flex px-52">
      <Navbar />
      <Map />
    </main>
  );
}
