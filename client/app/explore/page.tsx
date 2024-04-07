"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Post from "../components/SocialFeed/Post";
import { FaSearch } from "react-icons/fa";

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
  uniqueViewers: string[];
  numComments: number;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [currentTab, setCurrentTab] = useState<"forYou" | "following">(
    "forYou"
  );
  const [preFilteredPosts, setPreFilteredPosts] = useState<Array<Post>>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

  useEffect(() => {
    getPosts();
  }, [backendUrl, session?.user.accessToken]);

  function getPosts() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          setPosts(data);
          setPreFilteredPosts(data);
        });
      });
    }
  }

  function onSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const searchTerm = event.target.value;
    // Filter based on the original data
    const filteredPosts = preFilteredPosts.filter((post) =>
      post.content.includes(searchTerm)
    );
    setPosts(filteredPosts);
  }

  return (
    <main className="flex px-52">
      <Navbar />
      <div className="border-r-[1px] border-black w-[40vw] h-screen overflow-y-scroll">
        {/* SEARCH BAR */}
        <div className="flex items-center justify-between border-b-[1px] border-black p-4">
          <FaSearch className="text-lg mr-2 text-primary" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none w-full"
            onChange={onSearchChange}
          />
        </div>
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
            uniqueViewers={post.uniqueViewers}
            numComments={post.numComments}
          />
        ))}
      </div>
    </main>
  );
}
