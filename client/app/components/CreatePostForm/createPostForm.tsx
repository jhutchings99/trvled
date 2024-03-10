"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreatePostForm() {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");

  const { data: session } = useSession();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Session before submitting:", session?.user.accessToken);

    const response = await fetch("http://localhost:8080/posts/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify({
        content,
        location,
      }),
    });

    if (response.ok) {
      console.log("Post created successfully");
    } else {
      console.error("Failed to create post");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="content">Content:</label>
        <input
          type="text"
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <button type="submit">Create Post</button>
    </form>
  );
}
