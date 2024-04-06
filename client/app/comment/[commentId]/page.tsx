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

  //   useEffect(() => {
  //     if (session?.user.accessToken) {
  //       fetch(`${backendUrl}/posts/${ID}`, {
  //         method: "GET",
  //         headers: {
  //           Authorization: session?.user.accessToken || "",
  //         },
  //       }).then((res) => {
  //         res.json().then((data) => {
  //           console.log("POST", data);
  //           setPost(data);
  //           setLocalLikes(data.likes);
  //         });
  //       });

  //       getComments();
  //     }
  //   }, [backendUrl, session?.user.accessToken, ID, post?.userID]);

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
        console.log("COMMENTS:", data);
      });
    });
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

  function createCommentFormData() {
    const formData = new FormData();
    formData.append("image", newCommentCommentImage as Blob);
    formData.append("content", newCommentCommentContent);
    return formData;
  }

  function createCommentComment() {
    console.log(backendUrl);
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/comments/${commentId}/comment`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createCommentFormData(),
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          setIsCreatingCommentComment(false);
          getComments();
        });
      });
    }
  }

  return <div className="flex px-52">stuff</div>;
}
