export async function GET(req: any) {
  const { id } = req.params;
  return { message: `Fetching post ${id}` };
}

export async function DELETE(req: any) {
  const { id } = req.params;
  return { message: `Deleted post ${id}` };
}
