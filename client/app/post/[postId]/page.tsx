"use client";

import Image from "next/image";
import { IoChatboxOutline, IoHeart } from "react-icons/io5";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineAutoGraph } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LuDot } from "react-icons/lu";
import Navbar from "@/app/components/Navbar/Navbar";

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

interface Comment {
  ID: string;
  CreatedAt: string;
  content: string;
  likes: string[];
  userID: string;
  pictureUrl: string;
  User: User;
}

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

export default function PostPage({ params }: { params: { postId: string } }) {
  const ID = params.postId;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const [localLikes, setLocalLikes] = useState(post?.likes);

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log("POST", data);
          setPost(data);
          setLocalLikes(data.likes);
        });
      });

      fetch(`${backendUrl}/posts/${ID}/comments`).then((res) => {
        res.json().then((data) => {
          for (let i = 0; i < data.length; i++) {
            fetch(`${backendUrl}/users/${data[i].userID}`).then((res) => {
              res.json().then((userData) => {
                data[i].user = userData;
              });
            });
          }
          setComments(data);
          console.log(data);
        });
      });
    }
  }, [backendUrl, session?.user.accessToken, ID, post?.userID]);

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

  function likeUnlikeComment(commentId: string, index: number) {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/comments/${commentId}/like`, {
        method: "PATCH",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        if (res.ok) {
          // Check for successful like action
          res.json().then((updatedComment) => {
            // Update the comments array
            console.log("UPDATED COMMENT", updatedComment);
            setComments((prevComments) => {
              if (prevComments) {
                return prevComments.map((comment, i) => {
                  if (i === index) {
                    return updatedComment;
                  }
                  return comment;
                });
              } else {
                return null;
              }
            });
          });
        }
      });
    }
  }

  return (
    <div className="flex px-52">
      <Navbar />
      <main className="h-full w-[40vw]">
        <div>
          <div className="flex flex-col items-start p-4">
            <div className="flex items-start gap-2">
              <Image
                src={post?.User.profilePicture ?? ""}
                alt="profile picture"
                height={500}
                width={500}
                className="rounded-full h-12 w-12"
              />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">{post?.User.username}</p>
                  <p className="text-md text-gray-800">
                    @{post?.User.username}
                  </p>
                  <LuDot className="w-4 h-4" />
                  <p className="text-sm">{formatDate(post?.CreatedAt ?? "")}</p>
                </div>
                <p>{post?.content}</p>
                <p>{post?.location}</p>
                {post?.pictureURL != "" && (
                  <Image
                    src={post?.pictureURL ?? ""}
                    alt="post image"
                    height={200}
                    width={200}
                  />
                )}
              </div>
            </div>
          </div>

          {/* interaction bar */}
          <div className="flex justify-around py-2 border-b-[1px] border-black">
            {/* like */}
            <div className="flex items-center gap-1">
              {localLikes != undefined &&
              localLikes.includes(session?.user.email ?? "") ? (
                <IoHeart
                  className="text-red-500 w-5 h-5"
                  onClick={() => {
                    likeUnlikePost();
                  }}
                />
              ) : (
                <IoIosHeartEmpty
                  className="w-5 h-5"
                  onClick={() => {
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

          {/* comments */}
          <div>
            {comments?.map((comment, index) => (
              <div key={comment.ID} className="">
                <div className="flex flex-col items-start">
                  <div className="flex items-start gap-2 p-4">
                    <Image
                      src={comment.User.profilePicture ?? ""}
                      alt="profile picture"
                      height={500}
                      width={500}
                      className="rounded-full h-12 w-12"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-lg font-medium">
                          {comment.User.username}
                        </p>
                        <p className="text-md text-gray-800">
                          @{comment.User.username}
                        </p>
                        <LuDot className="w-4 h-4" />
                        <p className="text-sm">
                          {formatDate(comment.CreatedAt ?? "")}
                        </p>
                      </div>
                      <p>{comment.content}</p>
                      {comment.pictureUrl && (
                        <Image
                          src={comment.pictureUrl ?? ""}
                          alt="post image"
                          height={200}
                          width={200}
                        />
                      )}
                    </div>
                  </div>

                  {/* interaction bar */}
                  <div className="flex justify-around py-2 w-full border-b-[1px] border-black">
                    {/* like */}
                    <div className="flex items-center gap-1">
                      {comment.likes != undefined &&
                      comment.likes.includes(session?.user.email ?? "") ? (
                        <IoHeart
                          className="text-red-500 w-5 h-5"
                          onClick={() => {
                            likeUnlikeComment(comment.ID, index);
                          }}
                        />
                      ) : (
                        <IoIosHeartEmpty
                          className="w-5 h-5"
                          onClick={() => {
                            likeUnlikeComment(comment.ID, index);
                          }}
                        />
                      )}
                      <p className="text-md">
                        {comment.likes == undefined ? 0 : comment.likes.length}
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
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="border-l-[1px] border-black"></div>
    </div>
  );
}
