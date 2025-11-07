// src/pages/Home.jsx
import CategoryCard from "../components/CategoryCard.jsx";
import { motion } from "framer-motion";

/* 1 · gather images ------------------------------------------------ */
const allImages = import.meta.glob(
  "../Photos/*/*.{avif,webp,jpg,png}",
  { eager: true, query: "?url", import: "default" }
);

/* 2 · build { cars:[…], grad:[…] } */
const imagesByCategory = Object.entries(allImages).reduce((acc, [p, url]) => {
  const folder = p.split("/").at(-2).toLowerCase();
  (acc[folder] ??= []).push(url);
  return acc;
}, {});

/* 3 · card metadata ------------------------------------------------ */
const categories = [
  { id: "grad",         title: "Graduates",   blurb: "Graduation Photos", link: "/portfolio#grad" },
  { id: "cars",         title: "Cars",        blurb: "Automotive Photography", link: "/portfolio#cars" },
  { id: "wildlife",     title: "Wildlife",    blurb: "Animals & Nature", link: "/portfolio#wildlife" },
  // { id: "real_estate",  title: "Real Estate", blurb: "Homes & Apartments", link: "/portfolio#real_estate" },
  // { id: "architecture", title: "Architecture",blurb: "Buildings", link: "/portfolio#architecture" },
  { id: "lifestyle",    title: "Lifestyle",   blurb: "In the moment", link: "/portfolio#lifestyle" },
];

export default function Home() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-3 auto-rows-[1fr] pt-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
          >
            <CategoryCard
              images={imagesByCategory[cat.id] ?? []}
              {...cat}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
