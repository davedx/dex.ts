import React from "react";

export function Link({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === "undefined") return; // SSR: do nothing
    e.preventDefault();

    // Dynamically access the client router only when on the client
    import("../client/router.js").then(({ navigate }) => {
      navigate(href!);
    });
  }

  return (
    <a
      href={href}
      onClick={typeof window !== "undefined" ? handleClick : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
