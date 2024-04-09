"use client";

import Image from "next/image";

interface Memory {
  id: number;
  CreatedAt: string;
  imageUrl: string;
  note: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date().getTime();
  const timeDiff = Math.abs(now - date.getTime());

  const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
  const hoursElapsed = Math.floor(minutesElapsed / 60);

  let formattedDate;
  if (minutesElapsed < 60) {
    formattedDate = `${minutesElapsed}m`;
  } else if (hoursElapsed < 24) {
    formattedDate = `${hoursElapsed}h`;
  } else {
    formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }

  return formattedDate;
};

export default function Memory({ memory }: { memory: Memory }) {
  return (
    <main>
      <div className="flex flex-col pt-12 border-t-[1px] border-black">
        <div className="mx-auto">
          <Image
            src={memory.imageUrl}
            alt={memory.note}
            width={500}
            height={500}
            className=""
          />
          <p className="font-bold text-md">{formatDate(memory.CreatedAt)}</p>
          <p className=" text-md pb-2">{memory.note}</p>
        </div>
      </div>
    </main>
  );
}
