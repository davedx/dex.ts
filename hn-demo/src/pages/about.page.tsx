import { Page } from "dex.ts/client";
import { Layout } from "../shared/layout.js";

export const ssr = false;

const About: Page = () => (
  <Layout>
    <h1>About page</h1>
  </Layout>
);

export default About;
