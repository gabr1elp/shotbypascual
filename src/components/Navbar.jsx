import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const pages = [
  { to: "/",          label: "Home",      end: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services",  label: "Services"  },
  { to: "/about",     label: "About"     },
  { to: "/contact",   label: "Contact"   },
];

const linkStyle = ({ isActive }) =>
  `cursor-pointer block px-4 py-2 md:py-0 md:inline transition-colors duration-150 ${
    isActive ? "underline underline-offset-4" : "hover:text-bdblue" 
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  /* lock body scroll on mobile when menu is open */
  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.style.overflow = open ? "hidden" : "";
    }
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50
                       
                       backdrop-blur rounded-b-lg shadow-lg">
      <div className="mx-auto flex h-16 max-w-18xl items-center justify-between
                      px-4 sm:px-6 lg:px-8">

        {/* brand */}
        <NavLink
          to="/"
          className="flex items-center text-xl font-bold tracking-tight text-mist"
          style={{cursor: "pointer"}} 
        >
          ShotByPascual
        </NavLink>

        {/* desktop links */}
        <nav className="hidden md:flex items-center space-x-4 text-mist">
          {pages.map((p) => (
            <NavLink key={p.to} {...p} className={linkStyle}
            style={{cursor: "pointer"}}>
              {p.label}
            </NavLink>
          ))}
        </nav>

        {/* burger icon */}
        <button
          className="md:hidden rounded-xl text-mist p-2 hover:bg-glacier/25
                     transition-colors duration-150 cursor-pointer bg-transparent"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* mobile drop-down (always rendered, animated via classes) */}
      <div
        className={`md:hidden overflow-hidden bg-gradient-to-t from-obsidian/70 to-transparent text-mist
                    backdrop-blur shadow-lg
                    transform transition-all duration-300 ease-out
                    pb-2 rounded-b-lg cursor-pointer
                    ${open
                      ? 'max-h-64 opacity-100 translate-y-0'
                      : 'max-h-0  opacity-0  translate-y-3'}`}
      >
        {pages.map((p) => (
          <NavLink
            key={p.to}
            {...p}
            className={linkStyle}
            style={{cursor: "pointer"}}
            onClick={() => setOpen(false)}
          >
            {p.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}

/*bg-gradient-to-t from-obsidian/70 to-transparent*/