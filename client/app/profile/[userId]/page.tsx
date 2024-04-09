"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import Post from "../../components/SocialFeed/Post";
import { IoIosClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import WhoToFollow from "@/app/components/WhoToFollow/WhoToFollow";

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
  bio: string;
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
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

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
          // console.log(data);
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

  function onBioChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setNewBio(event.target.value);
  }

  function onProfilePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewProfilePicture(event.target.files[0]);
    }
  }

  function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewUsername(event.target.value);
  }

  function createUpdateUserForm() {
    const formData = new FormData();
    formData.append("image", newProfilePicture as Blob);
    formData.append("username", newUsername);
    formData.append("bio", newBio);
    return formData;
  }

  function updateProfile() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}`, {
        method: "PATCH",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createUpdateUserForm(),
      }).then((res) => {
        res.json().then((data) => {
          setIsUpdatingProfile(false);
          setUser(data);
        });
      });
    }
  }

  return (
    <>
      <main className="flex justify-center">
        <Navbar />
        <div className="flex flex-col border-r-[1px] border-black w-[35vw]">
          <div className="flex gap-8 items-center pl-4">
            <IoIosArrowRoundBack
              className="h-10 w-10 hover:cursor-pointer"
              onClick={() => {
                router.back();
              }}
            />
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
              <button
                className="bg-secondary text-primary px-12 py-2 rounded-full"
                onClick={() => {
                  setNewUsername(user.username);
                  setNewBio(user.bio);
                  setIsUpdatingProfile(true);
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
          <div className="pl-4">
            <h1 className="text-2xl font-bold mt-4">{user.username}</h1>
            <h1 className="text-md">@{user.username}</h1>

            <p className="text-md mt-4">{user.bio}</p>
            <p className="text-xs font-medium flex items-center gap-1 mt-4">
              <FaCalendarAlt />
              Joined on {formatDate(user.CreatedAt ?? "")}
            </p>
          </div>
          <div className="flex gap-4 mt-2 pb-6 pl-4">
            <p
              onClick={() => {
                router.push(`/followers/${ID}`);
              }}
              className="hover:underline hover:cursor-pointer"
            >
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
        <WhoToFollow />
      </main>

      {/* UPDATE USER POPUP */}
      {isUpdatingProfile && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px] z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsUpdatingProfile(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md z-50">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsUpdatingProfile(false);
              }}
            />
            <div className="p-6">
              <h1 className="uppercase font-bold text-sm pt-2">
                Update user profile
              </h1>
              <form>
                <input
                  type="text"
                  className="border-[1px] border-black w-full p-2 resize-none rounded mb-2"
                  placeholder="Enter new username..."
                  onChange={onUsernameChange}
                  defaultValue={user.username}
                />
                <textarea
                  name=""
                  id=""
                  className="border-[1px] border-black w-full h-[45vh] p-2 resize-none rounded"
                  placeholder="Enter new bio..."
                  onChange={onBioChange}
                  defaultValue={user.bio}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <input
                    type="file"
                    name="image"
                    accept=".png, .jpg, .jpeg"
                    onChange={onProfilePictureChange}
                  />
                  <button
                    className="bg-secondary text-primary px-8 py-2 font-medium rounded-sm shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      updateProfile();
                    }}
                    type="submit"
                  >
                    Update
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
