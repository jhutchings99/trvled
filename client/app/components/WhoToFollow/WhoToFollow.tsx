"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  profilePicture: string;
  ID: string;
}

export default function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user.id}/notFollowing`,
        {
          method: "GET",
        }
      ).then((res) => {
        res.json().then((data) => {
          setUsers(data);
          console.log(data);
        });
      });
    }
  }, [session?.user.accessToken]);

  return (
    <div className="w-[20vw] h-[100vh] border-r-[1px] border-black p-4 overflow-y-scroll no-scrollbar">
      <h1 className="font-bold pb-4">Recommended Travellers</h1>
      <div className="flex flex-col gap-4">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-2">
            {user.profilePicture && (
              <Image
                src={user.profilePicture}
                alt="profile picture"
                height={500}
                width={500}
                className="rounded-full h-12 w-12"
              />
            )}

            {!user.profilePicture && (
              <p className="rounded-full h-12 w-12 bg-gray-300 flex justify-center items-center">
                ?
              </p>
            )}
            <div className="flex flex-col">
              <h2
                className="font-bold text-md hover:underline hover:cursor-pointer"
                onClick={() => {
                  router.push(`/profile/${user.ID}`);
                }}
              >
                {user.username}
              </h2>
              <h2 className="text-xs">@{user.username}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
