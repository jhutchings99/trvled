"use client";

import Image from "next/image";

interface Memory {
  id: number;
  createdAt: Date;
  imageUrl: string;
  note: string;
}

export default function Memory({ memory }: { memory: Memory }) {
  return (
    <main>
      <div className="">
        {/* <Image src={memory.imageUrl} alt={memory.note} /> */}
        <p>{memory.note}</p>
      </div>
    </main>
  );
}
