import { Layout } from "../shared/layout.js";
import { Page } from "../client/router.js";

export const ssr = true;

const Home: Page = () => (
  <Layout>
    <h1>Home (SSR)</h1>
  </Layout>
);

export default Home;
