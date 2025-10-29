import { Layout } from "../client/layout";
import { Page } from "../client/router";

export const ssr = true;

const Home: Page = () => (
  <Layout>
    <h1>Home (SSR)</h1>
  </Layout>
);

export default Home;
