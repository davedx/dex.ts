import { Page } from "dex.ts/client";
import { Layout } from "../shared/layout.js";
import { PostForm } from "../shared/PostForm.js";
import { useEffect } from "react";

export const ssr = true;

const Home: Page = () => {
  useEffect(() => {
    (async function () {
      const result = await fetch("/api/posts");
      console.log(await result.json());
    })();
  }, []);
  return (
    <Layout>
      <h1>Hacker News Demo</h1>
      <PostForm />
    </Layout>
  );
};

export default Home;
