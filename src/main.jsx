import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";      // ← make sure this pkg is installed
import "./index.css";

// layout & pages
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Services from "./pages/Services.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

const router = createBrowserRouter([
  {
    element: <App />,            // global layout (Navbar + Outlet)
    children: [
      { index: true, element: <Home /> },          // “/”
      { path: "portfolio", element: <Portfolio /> },
      { path: "services",  element: <Services /> },
      { path: "about",     element: <About /> },
      { path: "contact",   element: <Contact /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
