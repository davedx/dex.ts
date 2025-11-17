import { ApiContext } from "src/types/context";

export async function GET({ prisma }: ApiContext, req: any) {
  const posts = await prisma.post.findMany();
  return posts;
}

export async function POST({ prisma }: ApiContext, req: any) {
  // TODO: auth/user/blah
  const userId = 1;
  const { url, title } = req.body;
  console.log(`url: ${url} title: ${title}`);
  const post = await prisma.post.create({
    data: {
      url,
      title,
      authorId: userId,
      votes: {
        create: {
          userId,
          value: 1, // author automatically upvotes their own post
        },
      },
    },
  });
  return { ok: true, post };
}
