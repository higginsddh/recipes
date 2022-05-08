import React from "react";

export default function IconButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={{ border: 0, backgroundColor: "transparent" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
