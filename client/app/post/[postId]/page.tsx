"use client";

import Image from "next/image";
import { IoChatboxOutline, IoHeart } from "react-icons/io5";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineAutoGraph } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LuDot } from "react-icons/lu";
import Navbar from "@/app/components/Navbar/Navbar";
import { IoIosClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import WhoToFollow from "@/app/components/WhoToFollow/WhoToFollow";

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
  pictureURL: string;
  User: User;
  uniqueViewers: string[];
  numComments: number;
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
  uniqueViewers: string[];
  numComments: number;
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
  const [isCreatingPostComment, setIsCreatingPostComment] = useState(false);
  const [isCreatingCommentComment, setIsCreatingCommentComment] =
    useState(false);
  const [newPostCommentContent, setNewPostCommentContent] = useState("");
  const [newPostCommentImage, setNewPostCommentImage] = useState<File | null>(
    null
  );
  const [newCommentCommentContent, setNewCommentCommentContent] = useState("");
  const [newCommentCommentImage, setNewCommentCommentImage] =
    useState<File | null>(null);
  const [commentId, setCommentId] = useState("");
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          // console.log("POST", data);
          setPost(data);
          setLocalLikes(data.likes);
        });
      });

      getComments();
    }
  }, [backendUrl, session?.user.accessToken, ID, post?.userID]);

  function getComments() {
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
        // console.log("COMMENTS:", data);
      });
    });
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
          // console.log(data);
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
            // console.log("UPDATED COMMENT", updatedComment);
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

  function onPostCommentContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewPostCommentContent(event.target.value);
  }

  function onPostCommentFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewPostCommentImage(event.target.files[0]);
    }
  }

  function onCommentCommentContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewCommentCommentContent(event.target.value);
  }

  function onCommentCommentFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      setNewCommentCommentImage(event.target.files[0]);
    }
  }

  function createPostFormData() {
    const formData = new FormData();
    formData.append("image", newPostCommentImage as Blob);
    formData.append("content", newPostCommentContent);
    return formData;
  }

  function createCommentFormData() {
    const formData = new FormData();
    formData.append("image", newCommentCommentImage as Blob);
    formData.append("content", newCommentCommentContent);
    return formData;
  }

  function createPostComment() {
    // console.log(backendUrl);
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/${ID}/comment`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createPostFormData(),
      }).then((res) => {
        res.json().then((data) => {
          // console.log(data);
          setIsCreatingPostComment(false);
          getComments();
        });
      });
    }
  }

  function createCommentComment() {
    // console.log(backendUrl);
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/comments/${commentId}/comment`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createCommentFormData(),
      }).then((res) => {
        res.json().then((data) => {
          // console.log(data);
          setIsCreatingCommentComment(false);
          getComments();
        });
      });
    }
  }

  return (
    <div className="flex justify-center">
      <Navbar />
      <main className="h-full w-[35vw]">
        <div className="flex gap-8 items-center pl-4">
          <IoIosArrowRoundBack
            className="h-10 w-10 hover:cursor-pointer"
            onClick={() => {
              router.back();
            }}
          />

          <h1 className="text-xl font-bold">Post</h1>
        </div>
        <div>
          <div className="flex flex-col items-start p-4">
            <div className="flex items-start gap-2">
              {post?.User.profilePicture && (
                <Image
                  src={post?.User.profilePicture}
                  alt="profile picture"
                  height={500}
                  width={500}
                  className="rounded-full h-12 w-12"
                />
              )}

              {!post?.User.profilePicture && (
                <p className="rounded-full h-12 w-12 bg-gray-200 flex justify-center items-center">
                  ?
                </p>
              )}
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">{post?.User.username}</p>
                  <p className="text-md text-gray-800">
                    @{post?.User.username}
                  </p>
                  <LuDot className="w-4 h-4" />
                  <p className="text-sm">{formatDate(post?.CreatedAt ?? "")}</p>
                </div>
                <p>{post?.location}</p>
                <p>{post?.content}</p>
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
            <div className="flex items-center gap-1 hover:cursor-pointer">
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
            <div
              className="flex items-center gap-1 hover:cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingPostComment(true);
              }}
            >
              <IoChatboxOutline className="w-5 h-5" />
              <p className="text-md">{post?.numComments}</p>
            </div>

            {/* views */}
            <div className="flex items-center gap-1">
              <MdOutlineAutoGraph className="w-5 h-5" />
              <p className="text-md">
                {post?.uniqueViewers == undefined
                  ? 0
                  : post?.uniqueViewers.length}
              </p>
            </div>
          </div>

          {/* comments */}
          <div>
            {comments?.map((comment, index) => (
              <div
                key={comment.ID}
                className="hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => {
                  router.push(`/comment/${comment.ID}`);
                }}
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-start gap-2 p-4">
                    {comment.User.profilePicture && (
                      <Image
                        src={comment.User.profilePicture}
                        alt="profile picture"
                        height={500}
                        width={500}
                        className="rounded-full h-12 w-12"
                      />
                    )}

                    {!comment.User.profilePicture && (
                      <p className="rounded-full h-12 w-12 bg-gray-200 flex justify-center items-center">
                        ?
                      </p>
                    )}
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
                      {comment.pictureURL && (
                        <Image
                          src={comment.pictureURL ?? ""}
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
                    <div className="flex items-center gap-1 hover:cursor-pointer">
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
                    <div
                      className="flex items-center gap-1 hover:cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCommentId(comment.ID);
                        setIsCreatingCommentComment(true);
                      }}
                    >
                      <IoChatboxOutline className="w-5 h-5" />
                      <p className="text-md">{comment.numComments}</p>
                    </div>

                    {/* views */}
                    <div className="flex items-center gap-1">
                      <MdOutlineAutoGraph className="w-5 h-5" />
                      <p className="text-md">
                        {comment.uniqueViewers == undefined
                          ? 0
                          : comment.uniqueViewers.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="border-l-[1px] border-black"></div>
      <WhoToFollow />

      {/* CREATE COMMENT POPUP */}
      {isCreatingPostComment && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px] z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreatingPostComment(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md z-50">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingPostComment(false);
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
                  placeholder="Write your comment here..."
                  onChange={onPostCommentContentChange}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <input
                    type="file"
                    name="image"
                    accept=".png, .jpg, .jpeg"
                    onChange={onPostCommentFileChange}
                  />
                  <button
                    className="bg-secondary text-primary px-8 py-2 font-medium rounded-sm shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      createPostComment();
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

      {/* CREATE COMMENT POPUP */}
      {isCreatingCommentComment && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px] z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreatingCommentComment(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md z-50">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingCommentComment(false);
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
                  placeholder="Write your comment here..."
                  onChange={onCommentCommentContentChange}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <input
                    type="file"
                    name="image"
                    accept=".png, .jpg, .jpeg"
                    onChange={onCommentCommentFileChange}
                  />
                  <button
                    className="bg-secondary text-primary px-8 py-2 font-medium rounded-sm shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      createCommentComment();
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
    </div>
  );
}
