import Image from "next/image";
import { IoChatboxOutline, IoHeart } from "react-icons/io5";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineAutoGraph } from "react-icons/md";
import { useSession } from "next-auth/react";

interface Post {
  content: string;
  location: string;
  pictureURL: string;
  likes: string[];
}

export default function Post({ content, location, pictureURL, likes }: Post) {
  const { data: session, update } = useSession();
  console.log("likes", likes);
  return (
    <main className="bg-green-400 mb-4">
      <div>
        <p>{location}</p>
        <p>{content}</p>
        {pictureURL != "" && (
          <Image src={pictureURL} alt="post image" height={200} width={200} />
        )}
        {/* interaction bar */}
        <div className="flex justify-around">
          {/* like */}
          <div className="flex items-center gap-1">
            {likes != undefined && likes.includes(session?.user.email ?? "") ? (
              <IoHeart className="text-red-500" />
            ) : (
              <IoIosHeartEmpty />
            )}
            <p className="text-md">{likes == undefined ? 0 : likes.length}</p>
          </div>

          {/* reply */}
          <div className="flex items-center gap-1">
            <IoChatboxOutline />
            <p className="text-md">1045</p>
          </div>

          {/* views */}
          <div className="flex items-center gap-1">
            <MdOutlineAutoGraph />
            <p className="text-md">423</p>
          </div>
        </div>
      </div>
    </main>
  );
}
