"use client";

import Link from "next/link";
import Logo from "../../../public/logo.svg";
import Image from "next/image";
import {
  MdMap,
  MdHome,
  MdOutlineSearch,
  MdOutlineListAlt,
  MdWorkspaces,
} from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";

interface User {
  username: string;
  profilePicture: string;
  CreatedAt: string;
}

export default function Navbar() {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostLocation, setNewPostLocation] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { data: session, update } = useSession();
  const [user, setUser] = useState({} as User);
  const router = useRouter();

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/users/${session?.user.id}`, {
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
  }, [backendUrl, session?.user.accessToken, session?.user.id]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewPostImage(event.target.files[0]);
    }
  }

  function onPostContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setNewPostContent(event.target.value);
  }

  function onPostLocationChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewPostLocation(event.target.value);
  }

  function createFormData() {
    const formData = new FormData();
    formData.append("image", newPostImage as Blob);
    formData.append("content", newPostContent);
    formData.append("location", newPostLocation);
    return formData;
  }

  function createPost() {
    // console.log(backendUrl);
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/posts/`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createFormData(),
      }).then((res) => {
        res.json().then((data) => {
          // console.log(data);
          setIsCreatingPost(false);
        });
      });
    }
  }

  return (
    <>
      <div className="w-[20vw] h-screen flex flex-col justify-between py-12 px-4 border-r-[1px] border-l-[1px] border-black">
        <div>
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="trvled logo" className="w-9" />
            <Link className="text-primary font-black text-4xl" href={"/home"}>
              trveld
            </Link>
          </div>
          <div className="flex flex-col gap-6 pt-8">
            <div className="flex items-center gap-2">
              <MdHome className="h-10 w-10" />
              <Link className="font-medium text-2xl" href={"/home"}>
                Home
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <MdMap className="h-10 w-10" />
              <Link className="font-medium text-2xl" href={"/map"}>
                Map
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <MdOutlineSearch className="h-10 w-10" />
              <Link className="font-medium text-2xl" href={"/explore"}>
                Explore
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="h-10 w-10" />
              <a
                className="font-medium text-2xl hover:cursor-pointer"
                onClick={() => {
                  router.push(`/profile/${session?.user.id}`);
                }}
              >
                Profile
              </a>
            </div>
            <button
              className="bg-secondary text-primary py-3 px-20 rounded-full font-bold"
              onClick={() => {
                setIsCreatingPost(true);
              }}
            >
              Post
            </button>
          </div>
        </div>
        <div className="w-full">
          {isLoggingOut && (
            <p
              className="mx-auto bg-gray-200 flex justify-center items-center py-4 rounded-md hover:bg-gray-300 hover:cursor-pointer mb-2"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              Log out <span className="font-medium pl-2">@{user.username}</span>
            </p>
          )}
          <a
            onClick={() => {
              setIsLoggingOut(!isLoggingOut);
            }}
          >
            <div
              className={`flex justify-between items-center hover:bg-gray-200 hover:cursor-pointer p-4 rounded-full ${
                isLoggingOut ? "bg-gray-200" : "bg-white"
              }`}
            >
              <div className="flex gap-2">
                {user.profilePicture && (
                  <Image
                    src={user.profilePicture ?? ""}
                    alt="Profile Picture"
                    width={200}
                    height={200}
                    className="rounded-full h-12 w-12"
                  />
                )}
                {!user.profilePicture && (
                  <p className="rounded-full h-12 w-12 bg-gray-200 flex items-center justify-center">
                    ?
                  </p>
                )}
                <div>
                  <p>{user.username}</p>
                  <p>@{user.username}</p>
                </div>
              </div>
              <MdWorkspaces className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>

      {/* CREATE POST POPUP */}
      {isCreatingPost && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px] z-40"
            onClick={() => {
              setIsCreatingPost(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md z-50">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={() => {
                setIsCreatingPost(false);
              }}
            />
            <div className="p-6">
              <h1 className="uppercase font-bold text-sm pt-2">
                Create a new post
              </h1>
              <form>
                <input
                  type="text"
                  placeholder="Enter the location of your post..."
                  className="border-[1px] border-black w-full p-2 resize-none rounded mb-2"
                  onChange={onPostLocationChange}
                />
                <textarea
                  name=""
                  id=""
                  className="border-[1px] border-black w-full h-[45vh] p-2 resize-none rounded"
                  placeholder="Write your post here..."
                  onChange={onPostContentChange}
                ></textarea>
                <div className="flex items-center justify-between pt-4">
                  <input
                    type="file"
                    name="image"
                    accept=".png, .jpg, .jpeg"
                    onChange={onFileChange}
                  />
                  <button
                    className="bg-secondary text-primary px-8 py-2 font-medium rounded-sm shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      createPost();
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
    </>
  );
}
