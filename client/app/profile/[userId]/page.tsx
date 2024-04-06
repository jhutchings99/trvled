"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import Post from "../../components/SocialFeed/Post";

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
  CreatedAt: string;
  followers: string[];
  following: string[];
}

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

export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const ID = params.userId;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [user, setUser] = useState<User>({} as User);
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [likedPosts, setLikedPosts] = useState<Array<Post>>([]);
  const [currentTab, setCurrentTab] = useState<"posts" | "likes">("posts");
  const { data: session, update } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    getUser();
    checkIfFollowing();
    getPosts();
  }, [backendUrl, session?.user.accessToken, session?.user.id]);

  function getUser() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          setUser(data);
        });
      });
    }
  }

  function getPosts() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/posts/`, {
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

  function getLikedPosts() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/posts/liked`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          setLikedPosts(data);
        });
      });
    }
  }

  function followUnfollowUser() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/follow`, {
        method: "PATCH",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          getUser();
          setIsFollowing(!isFollowing);
        });
      });
    }
  }

  function checkIfFollowing() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/isFollowing`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          setIsFollowing(data.isFollowing);
        });
      });
    }
  }

  return (
    <main className="flex px-52">
      <Navbar />
      <div className="flex flex-col border-r-[1px] border-black w-[40vw]">
        <div className="flex gap-8 items-center pl-4">
          <IoIosArrowRoundBack className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold">{user.username}</h1>
            <p className="text-xs">{posts.length ?? 0} posts</p>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 pt-4 pl-4">
          {user.profilePicture && (
            <Image
              src={user.profilePicture ?? ""}
              alt="Profile Picture"
              width={200}
              height={200}
              className="rounded-full h-20 w-20"
            />
          )}
          {!user.profilePicture && (
            <p className="rounded-full h-20 w-20 bg-gray-200 flex items-center justify-center">
              ?
            </p>
          )}

          {session?.user.id !== parseInt(ID) && (
            <button
              className="bg-secondary text-primary px-12 py-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                followUnfollowUser();
              }}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          {session?.user.id === parseInt(ID) && (
            <button className="bg-secondary text-primary px-12 py-2 rounded-full">
              Edit Profile
            </button>
          )}
        </div>
        <div className="pl-4">
          <h1 className="text-2xl font-bold mt-4">{user.username}</h1>
          <h1 className="text-md">@{user.username}</h1>

          <p className="text-md mt-4">Software Engineer</p>
          <p className="text-xs font-medium flex items-center gap-1 mt-4">
            <FaCalendarAlt />
            Joined on {formatDate(user.CreatedAt ?? "")}
          </p>
        </div>
        <div className="flex gap-4 mt-2 pb-6 pl-4 ">
          <p>
            <span className="font-bold">
              {user.following == undefined ? 0 : user.following.length}
            </span>{" "}
            following
          </p>
          <p>
            <span className="font-bold">
              {user.followers == undefined ? 0 : user.followers.length}
            </span>{" "}
            followers
          </p>
        </div>
        <div className="border-b-[1px] border-black flex gap-8 pl-4 pb-2">
          {currentTab === "posts" ? (
            <p className="text-lg font-bold">Posts</p>
          ) : (
            <p
              className="text-lg hover:cursor-pointer"
              onClick={() => {
                getPosts();
                setCurrentTab("posts");
              }}
            >
              Posts
            </p>
          )}

          {currentTab === "likes" ? (
            <p className="text-lg font-bold">Likes</p>
          ) : (
            <p
              className="text-lg hover:cursor-pointer"
              onClick={() => {
                getLikedPosts();
                setCurrentTab("likes");
              }}
            >
              Likes
            </p>
          )}
        </div>
        <div>
          {currentTab === "posts" &&
            posts.map((post, index) => (
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

          {likedPosts &&
            currentTab === "likes" &&
            likedPosts.map((post, index) => (
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
      </div>
    </main>
  );
}
