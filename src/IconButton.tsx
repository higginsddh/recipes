import React from "react";

export default function IconButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="btn btn-link"
      style={{ border: 0, backgroundColor: "transparent", padding: 0 }}
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}
