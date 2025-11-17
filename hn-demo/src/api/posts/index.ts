import { ApiContext } from "src/types/context";

export async function GET({ prisma }: ApiContext, req: any) {
  const posts = await prisma.post.findMany();
  return posts;
}

export async function POST({ prisma }: ApiContext, req: any) {
  return { ok: true, text: req.body.text };
}
