import { Check } from "lucide-react";
import { motion } from "framer-motion";          // ← NEW

/* edit or replace these with your real offerings */
const packages = [
  {
    id: "express",
    name: "Express Session",
    price: 89,
    tagline: "45-min · 10-15 edits",
    features: ["One location", 
               "Online gallery", 
               "96-hr delivery"],
  },
  {
    id: "standard",
    name: "Standard Session",
    price: 149,
    tagline: "90-min · 25-30 edits",
    features: ["2-3 Locations", 
               "Online gallery", 
               "72-hr delivery"],
  },
  {
    id: "premium",
    name: "Premium Session",
    price: 209,
    tagline: "135-min · 40+ edits",
    features: [
      "Multiple locations",
      "Online gallery",
      "48-hr delivery",
    ],
  },
];

/* simple card */
function PackageCard({ pkg }) {
  return (
    <div className="rounded-3xl bg-obsidian/70 backdrop-blur ring-1 ring-obsidian/40 p-8 text-mist">
      <h3 className="text-2xl font-semibold text-glacier">{pkg.name}</h3>
      <p className="mt-1 text-sm text-tidepool/80">{pkg.tagline}</p>

      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold">${pkg.price}</span>
        <span className="text-xs text-mist/60">USD</span>
      </p>

      <ul className="mt-6 space-y-2 text-sm">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check size={14} className="text-glacier" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* page */
export default function Services() {
  return (
    <section className="px-4 py-24 text-center text-mist">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-5xl md:text-6xl font-extrabold"
      >
        Services&nbsp;&amp; Pricing
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mx-auto mt-4 max-w-xl text-lg text-mist/80"
      >
        Choose the package that fits your shoot best.
      </motion.p>

      {/* responsive grid: 1col → 2 → 3 */}
      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
          >
            <PackageCard pkg={pkg} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
