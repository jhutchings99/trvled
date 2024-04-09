"use client";

import Image from "next/image";
import { IoChatboxOutline, IoHeart } from "react-icons/io5";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineAutoGraph } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LuDot } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";

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
  uniqueViewers: string[];
  numComments: number;
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
  uniqueViewers,
  numComments,
}: Post) {
  //console.log("USER", User);
  const [localLikes, setLocalLikes] = useState(likes);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [numberComments, setNumberComments] = useState(numComments);
  const [newCommentImage, setNewCommentImage] = useState<File | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const router = useRouter();

  function onCommentContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewCommentContent(event.target.value);
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewCommentImage(event.target.files[0]);
    }
  }

  function createFormData() {
    const formData = new FormData();
    formData.append("image", newCommentImage as Blob);
    formData.append("content", newCommentContent);
    return formData;
  }

  function createComment() {
    //console.log(backendUrl);
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}/comment`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createFormData(),
      }).then((res) => {
        res.json().then((data) => {
          //console.log(data);
          setIsCreatingComment(false);
          setNumberComments(numberComments + 1);
        });
      });
    }
  }

  function likeUnlikePost() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}/like`, {
        method: "PATCH",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          //console.log(data);
          //   update the post to reflect the new likes
          setLocalLikes(data.likes);
        });
      });
    }
  }

  // set the number of comments on first render
  useEffect(() => {
    setNumberComments(numComments);
  }, [numComments]);

  return (
    <>
      <main
        className="border-b-[1px] border-black p-4 hover:bg-gray-100 hover:cursor-pointer"
        onClick={() => {
          router.push(`/post/${ID}`);
        }}
      >
        <div>
          <div className="flex flex-col items-start">
            <div className="flex items-start gap-2">
              {User.profilePicture && (
                <Image
                  src={User.profilePicture}
                  alt="profile picture"
                  height={500}
                  width={500}
                  className="rounded-full h-12 w-12"
                />
              )}

              {!User.profilePicture && (
                <p className="rounded-full h-12 w-12 bg-gray-200 flex justify-center items-center">
                  ?
                </p>
              )}
              <div>
                <div className="flex items-center gap-1">
                  <p
                    className="text-lg font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/profile/${userID}`);
                    }}
                  >
                    {User.username}
                  </p>
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
            <div
              className="flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingComment(true);
              }}
            >
              <IoChatboxOutline className="w-5 h-5" />
              <p className="text-md">{numberComments}</p>
            </div>

            {/* views */}
            <div className="flex items-center gap-1">
              <MdOutlineAutoGraph className="w-5 h-5" />
              <p className="text-md">
                {uniqueViewers == undefined ? 0 : uniqueViewers.length}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE COMMENT POPUP */}
      {isCreatingComment && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px] z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreatingComment(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md z-50">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingComment(false);
              }}
            />
            <div className="p-6">
              <h1 className="uppercase font-bold text-sm pt-2">
                Create a new comment
              </h1>
              <form>
                <textarea
                  name=""
                  id=""
                  className="border-[1px] border-black w-full h-[45vh] p-2 resize-none rounded"
                  placeholder="Write your post here..."
                  onChange={onCommentContentChange}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <input
                    type="file"
                    name="image"
                    accept=".png, .jpg, .jpeg"
                    onChange={onFileChange}
                  />
                  <button
                    className="bg-secondary text-primary px-8 py-2 font-medium rounded-sm shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      createComment();
                    }}
                    type="submit"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
