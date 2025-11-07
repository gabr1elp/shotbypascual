import { useState, useEffect } from "react";
import { motion } from "framer-motion";           // ← NEW
import { ChevronUp } from "lucide-react";

/* 1 · import every image in src/Photos/<category>/* */
const allImgs = import.meta.glob(
  "../Photos/*/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, query: "?url", import: "default" }
);

/* 2 · build { cars:[…], grad:[…] } */
const byCat = Object.entries(allImgs).reduce((acc, [p, url]) => {
  const k = p.split("/").at(-2).toLowerCase();
  (acc[k] ??= []).push(url);
  return acc;
}, {});

/* 3 · section order & names */
const categories = [
  { id: "grad",         title: "Graduation Photos" },
  { id: "cars",         title: "Automotive Photography" },
  { id: "wildlife",     title: "Wildlife" },
  // { id: "real_estate",  title: "Real Estate" },
  // { id: "architecture", title: "Architecture" },
  { id: "lifestyle",    title: "Lifestyle" },
];

export default function Portfolio() {
  const [showBtn, setShowBtn] = useState(false);

  /* --- scroll-to-hash helpers (unchanged) --------------------------- */
  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, []);

  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;
    const section = document.querySelector(hash);
    if (!section) return;
    const imgs = Array.from(section.querySelectorAll("img"));
    if (imgs.length === 0) return;
    let loaded = 0;
    const check = () => ++loaded === imgs.length && section.scrollIntoView({ block: "start" });
    const fallback = setTimeout(() => section.scrollIntoView({ block: "start" }), 800);
    imgs.forEach(img =>
      img.complete
        ? check()
        : (img.addEventListener("load", check, { once: true }),
          img.addEventListener("error", check, { once: true }))
    );
    return () => clearTimeout(fallback);
  }, []);

  /* show back-to-top button when scrolling */
  useEffect(() => {
    const onScroll = () => setShowBtn(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {categories.map((c, i) => (
          <motion.section
            key={c.id}
            id={c.id}
            className="scroll-mt-24 pt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
          >
            <h2 className="mb-12 text-4xl md:text-5xl font-extrabold text-center text-glacier">
              {c.title}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {(byCat[c.id] ?? []).map((url, j) => (
                <motion.img
                  key={url}
                  src={url}
                  srcSet={`${url}?w=400 400w, ${url}?w=800 800w`}
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  loading="lazy"
                  alt={`${c.title} photograph`}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: j * 0.02 }}
                />
              ))}
            </div>

            <div className="h-16" />
          </motion.section>
        ))}
      </main>

      {/* floating back-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center
                    justify-center rounded-full bg-bdblue text-obsidian
                    shadow-lg transition-all duration-300 cursor-pointer
                    ${showBtn ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronUp size={22} />
      </button>
    </>
  );
}
