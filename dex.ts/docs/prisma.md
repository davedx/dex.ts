# Prisma cookbook

1. npm install dotenv prisma @prisma/client
2. npx prisma init
3. Add your DATABASE_URL in the .env of your project
4. npx prisma migrate dev --name init
5. Add ApiContext type in your project: `export type ApiContext = { prisma: PrismaClient };`
6. In server.ts:

```
createDexServer({
  context: {
    prisma: new PrismaClient(),
  },
});
```

7. In API handler:

```
export async function GET({ prisma }: ApiContext, req: any) {
  const posts = await prisma.post.findMany();
  return posts;
}
```
