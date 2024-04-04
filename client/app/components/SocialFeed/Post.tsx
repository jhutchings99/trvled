"use client";

import Image from "next/image";
import { IoChatboxOutline, IoHeart } from "react-icons/io5";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineAutoGraph } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LuDot } from "react-icons/lu";
import { useRouter } from "next/navigation";

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

interface Post {
  ID: string;
  CreatedAt: string;
  content: string;
  location: string;
  pictureURL: string;
  likes: string[];
  userID: string;
  User: User;
}

interface User {
  username: string;
  profilePicture: string;
}

export default function Post({
  ID,
  CreatedAt,
  content,
  location,
  pictureURL,
  likes,
  userID,
  User,
}: Post) {
  console.log("USER", User);
  const [localLikes, setLocalLikes] = useState(likes);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const router = useRouter();

  function likeUnlikePost() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}/like`, {
        method: "PATCH",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          //   update the post to reflect the new likes
          setLocalLikes(data.likes);
        });
      });
    }
  }

  return (
    <main
      className="border-b-[1px] border-black p-4 hover:bg-gray-100 hover:cursor-pointer"
      onClick={() => {
        router.push(`/post/${ID}`);
      }}
    >
      <div>
        <div className="flex flex-col items-start">
          <div className="flex items-start gap-2">
            <Image
              src={User.profilePicture}
              alt="profile picture"
              height={500}
              width={500}
              className="rounded-full h-12 w-12"
            />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-lg font-medium">{User.username}</p>
                <p className="text-md text-gray-800">@{User.username}</p>
                <LuDot className="w-4 h-4" />
                <p className="text-sm">{formatDate(CreatedAt)}</p>
              </div>
              <p>{content}</p>
              <p>{location}</p>
              {pictureURL != "" && (
                <Image
                  src={pictureURL}
                  alt="post image"
                  height={200}
                  width={200}
                />
              )}
            </div>
          </div>
        </div>

        {/* interaction bar */}
        <div className="flex justify-around py-2">
          {/* like */}
          <div className="flex items-center gap-1">
            {localLikes != undefined &&
            localLikes.includes(session?.user.email ?? "") ? (
              <IoHeart
                className="text-red-500 w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  likeUnlikePost();
                }}
              />
            ) : (
              <IoIosHeartEmpty
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  likeUnlikePost();
                }}
              />
            )}
            <p className="text-md">
              {localLikes == undefined ? 0 : localLikes.length}
            </p>
          </div>

          {/* reply */}
          <div className="flex items-center gap-1">
            <IoChatboxOutline className="w-5 h-5" />
            <p className="text-md">1045</p>
          </div>

          {/* views */}
          <div className="flex items-center gap-1">
            <MdOutlineAutoGraph className="w-5 h-5" />
            <p className="text-md">423</p>
          </div>
        </div>
      </div>
    </main>
  );
}
