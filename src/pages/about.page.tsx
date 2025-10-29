import { useState } from "react";
import { Page } from "../client/router";
import { Layout } from "../client/layout";

export const ssr = true;
// no ssr export => CSR only
const About: Page = () => {
  const [count, setCount] = useState(0);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">About Page</h1>
        <p>This page is hydrated — try the counter below.</p>
        <button
          onClick={() => setCount(count + 1)}
          className="mt-4 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Count: {count}
        </button>
      </div>
    </Layout>
  );
};
export default About;
