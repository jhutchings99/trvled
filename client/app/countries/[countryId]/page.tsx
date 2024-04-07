"use client";

import Navbar from "../../components/Navbar/Navbar";
import { countryIdToName } from "@/app/helpers/countryIdToName";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Memory from "@/app/components/Memory/Memory";
import { IoIosClose } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

interface Params {
  countryId: number;
  countryName: string;
}

interface Memory {
  id: number;
  createdAt: Date;
  imageUrl: string;
  note: string;
}

export default function CountryPage({ params }: { params: Params }) {
  const [memories, setMemories] = useState<Array<Memory>>([]);
  const [isCreatingMemory, setIsCreatingMemory] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryImage, setNewMemoryImage] = useState<File | null>(null);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const countryName = countryIdToName[String(params.countryId)];
  const { data: session, update } = useSession();

  useEffect(() => {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/memories/${params.countryId}`, {
        method: "GET",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          setMemories(data);
        });
      });
    }
  }, [
    backendUrl,
    memories.length,
    params.countryId,
    session?.user.accessToken,
  ]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewMemoryImage(event.target.files[0]);
    }
  }

  function onMemoryContentChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewMemoryContent(event.target.value);
  }

  function createFormData() {
    const formData = new FormData();
    formData.append("image", newMemoryImage as Blob);
    formData.append("note", newMemoryContent);
    return formData;
  }

  function createMemory() {
    if (session?.user.accessToken) {
      fetch(`${backendUrl}/memories/${params.countryId}`, {
        method: "POST",
        headers: {
          Authorization: session?.user.accessToken || "",
        },
        body: createFormData(),
      }).then((res) => {
        res.json().then((data) => {
          console.log(data);
          setMemories([...memories, data]);
        });
      });
    }
  }
  // /:userId/:location/:locationId
  function visitUnvisitCountry() {
    if (session?.user.accessToken) {
      fetch(
        `${backendUrl}/users/${session?.user.id}/global/${params.countryId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: session?.user.accessToken || "",
          },
        }
      ).then((res) => {
        res.json().then((data) => {
          console.log("Backend update response:", data); // Did the backend update succeed?

          // Log the session before the update
          console.log("Session before update:", session);

          update();

          // Log the session after the update
          console.log("Session after update:", session);
        });
      });
      // ).then((res) => {
      //   res.json().then((data) => {
      //     console.log(data);
      //     setMemories([...memories, data]);
      //   });
      // });
    }
  }

  return (
    <main className="flex px-52">
      <Navbar />
      <div className="flex flex-col w-full border-r-[1px] border-black px-4">
        <div className="flex gap-2 items-center">
          <IoIosArrowRoundBack
            className="h-10 w-10 hover:cursor-pointer"
            onClick={() => {
              router.back();
            }}
          />
          <h1 className="text-xl font-bold">Back</h1>
        </div>
        <div className="flex items-center justify-around pb-1 h-24">
          <div className="flex items-center gap-2">
            <p className="text-md uppercase font-medium">Visited</p>
            <input
              type="checkbox"
              className="h-4 w-4"
              // checked={session?.user.usaVisited.includes(params.countryId)}
              defaultChecked={
                session?.user.globalVisited
                  ? session?.user.globalVisited.includes(params.countryId)
                  : false
              }
              key={Math.random()}
              onChange={visitUnvisitCountry}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center pt-12 pb-6">
            {countryName}
          </h1>
          <button
            onClick={() => {
              setIsCreatingMemory(true);
            }}
          >
            Create Memory
          </button>
        </div>
        <div className="">
          {memories.map((memory, index) => (
            <Memory key={index} memory={memory} />
          ))}
        </div>
      </div>

      {/* CREATE MEMORY POPUP */}
      {isCreatingMemory && (
        <>
          <div
            className="bg-blur w-screen h-screen fixed top-0 left-0 backdrop-blur-[2px]"
            onClick={() => {
              setIsCreatingMemory(false);
            }}
          ></div>
          <div className="bg-white w-[30vw] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md">
            <IoIosClose
              className="absolute top-0 right-0 h-10 w-10 cursor-pointer"
              onClick={() => {
                setIsCreatingMemory(false);
              }}
            />
            <div className="p-6">
              <h1 className="uppercase font-bold text-sm pt-2">
                Create a new memory
              </h1>
              <form>
                <textarea
                  name=""
                  id=""
                  className="border-[1px] border-black w-full h-[45vh] p-2 resize-none"
                  placeholder="Write your memory here..."
                  onChange={onMemoryContentChange}
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
                      console.log(newMemoryContent, newMemoryImage);
                      createMemory();
                    }}
                    type="submit"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
