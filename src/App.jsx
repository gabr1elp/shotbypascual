// src/App.jsx
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    // Make the whole page a flex‐column that’s at least the full viewport height:
    <div className="">
      <Navbar />

      {/* Let the page content grow and push footer to bottom */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
