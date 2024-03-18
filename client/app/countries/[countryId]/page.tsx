"use client";

import Navbar from "../../components/Navbar/Navbar";
import { countryIdToName } from "@/app/helpers/countryIdToName";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Memory from "@/app/components/Memory/Memory";

interface Params {
  countryId: number;
  countryName: string;
}

interface Memory {
  id: number;
  createdAt: Date;
  imageUrl: string;
  note: string;
}

export default function CountryPage({ params }: { params: Params }) {
  const [memories, setMemories] = useState<Array<Memory>>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const countryName = countryIdToName[String(params.countryId)];
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/memories/${params.countryId}`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          setMemories(data);
        });
      });
    }
  }, [
    backendUrl,
    memories.length,
    params.countryId,
    session?.user.accessToken,
  ]);

  return (
    <main className="flex px-52">
      <Navbar />
      <div className="flex flex-col w-full border-r-[1px] border-black px-4">
        <h1 className="text-4xl font-bold mb-4 text-center pt-12 pb-6">
          {countryName}
        </h1>
        <div className="">
          {memories.map((memory, index) => (
            <Memory key={index} memory={memory} />
          ))}
        </div>
      </div>
    </main>
  );
}
