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
  ID: string;
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
  const [currentTab, setCurrentTab] = useState<"followers" | "following">(
    "followers"
  );
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const { data: session, update } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/");
  }

  useEffect(() => {
    getUser();
    getFollowers();
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

  function getFollowers() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/followers`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          //   console.log("Followers", data);
          setFollowers(data);
        });
      });
    }
  }

  function getFollowing() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${ID}/following`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          //   console.log("Following", data);
          setFollowing(data);
        });
      });
    }
  }

  return (
    <>
      <main className="flex px-52">
        <Navbar />
        <div className="flex flex-col border-r-[1px] border-black w-[40vw]">
          <div className="flex gap-8 items-center pl-4">
            <IoIosArrowRoundBack
              className="h-10 w-10 hover:cursor-pointer"
              onClick={() => {
                router.back();
              }}
            />
            <div>
              <h1 className="text-xl font-bold">{user.username}</h1>
              <h1 className="text-xs">@{user.username}</h1>
            </div>
          </div>

          <div className="flex justify-around pt-4 border-b-[1px] border-black">
            {currentTab === "followers" && (
              <div>
                <p className="font-bold">Followers</p>
                <div className="w-full h-1 bg-primary mb-2"></div>
              </div>
            )}
            {currentTab !== "following" && (
              <p
                className="hover:cursor-pointer"
                onClick={() => {
                  getFollowing();
                  setCurrentTab("following");
                }}
              >
                Following
              </p>
            )}

            {currentTab !== "followers" && (
              <p
                className="hover:cursor-pointer"
                onClick={() => {
                  getFollowers();
                  setCurrentTab("followers");
                }}
              >
                Followers
              </p>
            )}
            {currentTab === "following" && (
              <div>
                <p className="font-bold">Following</p>
                <div className="w-full h-1 bg-primary mb-2"></div>
              </div>
            )}
          </div>

          <div>
            {currentTab === "followers" && (
              <div className="flex p-4">
                {followers.map((follower, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Image
                          src={follower.profilePicture}
                          alt="profile picture"
                          height={50}
                          width={50}
                          className="rounded-full w-12 h-12"
                        />
                        <div>
                          <p
                            className="font-bold text-lg hover:underline hover:cursor-pointer"
                            onClick={() => {
                              router.push(`/profile/${follower.ID}`);
                            }}
                          >
                            {follower.username}
                          </p>
                          <p className="text-xs">@{follower.username}</p>
                        </div>
                      </div>
                      <p className="pl-14 text-sm">{follower.bio}</p>
                    </div>
                    <p className="border-[1px] border-primary rounded-full px-4 py-2">
                      Follows You
                    </p>
                  </div>
                ))}
              </div>
            )}

            {currentTab === "following" && (
              <div className="flex p-4">
                {following.map((followee, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Image
                          src={followee.profilePicture}
                          alt="profile picture"
                          height={50}
                          width={50}
                          className="rounded-full w-12 h-12"
                        />
                        <div>
                          <p
                            className="font-bold text-lg hover:underline hover:cursor-pointer"
                            onClick={() => {
                              router.push(`/profile/${followee.ID}`);
                            }}
                          >
                            {followee.username}
                          </p>
                          <p className="text-xs">@{followee.username}</p>
                        </div>
                      </div>
                      <p className="pl-14 text-sm">{followee.bio}</p>
                    </div>
                    <p className="border-[1px] border-primary rounded-full px-4 py-2">
                      Following
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
