"use client";
import { useEffect, useState } from "react";
import Post from "./Post";
import { useSession } from "next-auth/react";

interface User {
  username: string;
  profilePicture: string;
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

export default function SocialFeed() {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log("DATA", data);
          setPosts(data);
        });
      });
    }
  }, [backendUrl, session?.user.accessToken]);

  console.log(posts);

  return (
    <main className="border-r-[1px] border-black w-[40vw] h-screen overflow-y-scroll">
      {posts.map((post, index) => (
        <Post
          key={index}
          ID={post.ID}
          CreatedAt={post.CreatedAt}
          content={post.content}
          location={post.location}
          pictureURL={post.pictureURL}
          likes={post.likes}
          userID={post.userID}
          User={post.User}
        />
      ))}
    </main>
  );
}
