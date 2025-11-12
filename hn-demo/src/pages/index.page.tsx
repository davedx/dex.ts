import { Page } from "dex.ts/client";
import { Layout } from "../shared/layout.js";
import { PostForm } from "../shared/PostForm.js";

export const ssr = true;

const Home: Page = () => (
  <Layout>
    <h1>Hacker News Demo</h1>
    <PostForm />
  </Layout>
);

export default Home;
