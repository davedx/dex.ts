import { useEffect, useState } from "react";

export function PostForm() {
  const [text, setText] = useState("");

  const onPost = async () => {
    const result = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const data = await result.json();
    console.log(data);
  };

  useEffect(() => {
    (async function () {
      const result = await fetch("/api/posts/123");
      console.log(await result.json());
    })();
  }, []);

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => onPost()}>Post</button>
    </div>
  );
}
