import { Link } from "./router";

type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>{children}</main>
    </>
  );
}
