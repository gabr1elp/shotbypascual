// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-mist py-4">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm">
        © {currentYear} shotbypascual. All rights reserved.
      </div>
    </footer>
  );
}
