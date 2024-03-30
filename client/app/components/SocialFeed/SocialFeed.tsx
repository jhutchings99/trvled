"use client";
import { useEffect, useState } from "react";
import Post from "./Post";
import { useSession } from "next-auth/react";

const test = [
  {
    content: "I'm a post",
    location: "New York",
    pictureUrl:
      "https://repository-images.githubusercontent.com/260096455/47f1b200-8b2e-11ea-8fa1-ab106189aeb0",
  },
  {
    content: "I'm another post",
    location: "Los Angeles",
    pictureUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbcsTQdBsDIMY_YW8GEx5Zsz97KWZ9mhsN6MEb7crmlQ&s",
  },
  {
    content: "I'm a third",
    location: "Chicago",
    pictureUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlkWb3ByNH1CiWa2KO4LZxRusfNCcYoAUOQQWQ0zNCjknMXlw4OSBcwTXqXiVEkyxvhvc&usqp=CAU",
  },
];

interface Post {
  content: string;
  location: string;
  pictureURL: string;
  likes: string[];
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
          //   console.log(data);
          setPosts(data);
        });
      });
    }
  }, [backendUrl, session?.user.accessToken]);

  console.log(posts);

  return (
    <main className="bg-red-400 border-r-[1px] border-black w-[60vw] h-screen overflow-y-scroll">
      {posts.map((post, index) => (
        <Post
          key={index}
          content={post.content}
          location={post.location}
          pictureURL={post.pictureURL}
          likes={post.likes}
        />
      ))}
    </main>
  );
}
