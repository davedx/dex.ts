import { Link } from "./Link.js";

type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
      <main>{children}</main>
    </>
  );
}
