"use client";
import { useEffect, useState } from "react";
import Post from "./Post";
import { useSession } from "next-auth/react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

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

export default function SocialFeed() {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [currentTab, setCurrentTab] = useState<"forYou" | "following">(
    "forYou"
  );
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const router = useRouter();

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
        });
      });
    }
  }

  function getFollowingPosts() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${session?.user.id}/following/posts`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log("Following", data);
          setPosts(data);
        });
      });
    }
  }

  return (
    <main className="border-r-[1px] border-black w-[40vw] h-screen overflow-y-scroll">
      <div className="flex gap-8 items-center">
        <div className="flex justify-around pt-4 border-b-[1px] border-black w-full">
          {currentTab === "forYou" && (
            <div>
              <p className="font-bold">For you</p>
              <div className="w-full h-1 bg-primary mb-2"></div>
            </div>
          )}
          {currentTab !== "following" && (
            <p
              className="hover:cursor-pointer"
              onClick={() => {
                getFollowingPosts();
                setCurrentTab("following");
              }}
            >
              Following
            </p>
          )}

          {currentTab !== "forYou" && (
            <p
              className="hover:cursor-pointer"
              onClick={() => {
                getPosts();
                setCurrentTab("forYou");
              }}
            >
              For You
            </p>
          )}
          {currentTab === "following" && (
            <div>
              <p className="font-bold">Following</p>
              <div className="w-full h-1 bg-primary mb-2"></div>
            </div>
          )}
        </div>
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
    </main>
  );
}
