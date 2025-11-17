import { ApiContext } from "src/types/context";

export async function GET({ prisma }: ApiContext, req: any) {
  const { id } = req.params;
  return { message: `Fetching post ${id}` };
}

export async function DELETE({ prisma }: ApiContext, req: any) {
  const { id } = req.params;
  return { message: `Deleted post ${id}` };
}
