import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t mt-12 py-6 bg-background/95">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} saaarthi — Interactive Urban Issue Reporter</div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
