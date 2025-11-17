import { Page } from "dex.ts/client";
import { Layout } from "../shared/layout.js";
import { PostForm } from "../shared/PostForm.js";
import { useEffect, useState } from "react";
import { Post } from "generated/prisma/client.js";

export const ssr = true;

export type HomeData = {
  posts: { id: number; title: string; url: string | null }[];
};

export async function load({ context }: { context: any }): Promise<HomeData> {
  const posts = await context.prisma.post.findMany({
    orderBy: { hotRank: "desc" },
    take: 50,
  });
  return { posts };
}

export default function Home({ data }: { data: HomeData }) {
  return (
    <Layout>
      <h1>Hacker News Demo</h1>
      {data.posts.map((post: any) => {
        return (
          <div key={post.id}>
            {post.url} {post.title}
          </div>
        );
      })}
      <PostForm />
    </Layout>
  );
}
