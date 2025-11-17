import { useEffect, useState } from "react";

export function PostForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const onPost = async () => {
    const result = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, title }),
    });
    const data = await result.json();
    console.log(data);
  };

  return (
    <div>
      <label>URL:</label>
      <input value={url} onChange={(e) => setUrl(e.target.value)} />
      <label>Title:</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={() => onPost()}>Post</button>
    </div>
  );
}
