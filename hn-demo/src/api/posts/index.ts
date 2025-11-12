export async function GET(req: any) {
  return [{ id: 1, text: "Hello world" }];
}

export async function POST(req: any) {
  return { ok: true, text: req.body.text };
}
