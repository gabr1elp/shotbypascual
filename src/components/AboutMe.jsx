// src/components/AboutMeSection.jsx
import { useState, useEffect } from "react";
import {
  Instagram,
  Mail,
  Phone,
} from "lucide-react";         // npm i lucide-react
import { Link } from "react-router-dom";

/* auto-grab every image in Photos/Self */
const portraits = Object.values(
  import.meta.glob("../Photos/self/*.{jpg,jpeg,png,webp,avif,JPEG}", {
    eager: true,
    query: '?url', import: 'default',
  })
);

export default function AboutMeSection({ interval = 2500 }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (portraits.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % portraits.length), interval);
    return () => clearInterval(t);
  }, [interval]);

  const current = portraits[idx];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-8">
      <div className="flex flex-col items-center pt-5 gap-14 md:flex-row">
        {/* 3 : 4 portrait, top-center crop */}
        <div className="relative aspect-[3/4] w-full max-w-[380px] overflow-hidden rounded-3xl shadow-xl">
          <img
            src={current}
            alt="Gabriel Pascual"
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        </div>

        {/* bio + contacts */}
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-4xl font-semibold text-mist">Hello, I’m Gabriel</h2>
          <p className="mt-4 text-lg leading-7 text-mist/60">
            I’m a Mechanical Engineer and Consultant with a passion for storytelling — 
            and photography has become one of my favorite ways to bring stories to life. 
            Through my lens, I capture moments with purpose, reflecting the character and 
            emotion behind them. Ready to tell your story? Let’s connect!
          </p>

          {/* contact row */}
          <ul className="mt-8 flex flex-col items-center gap-4 text-glacier/70 md:flex-row md:items-start cursor-pointer">
            <ContactItem
              href="https://instagram.com/shotbypascual"
              icon={<Instagram size={18} />}
              label="@shotbypascual"
            />
            <ContactItem
              href="tel:+17862534432"
              icon={<Phone size={18} />}
              label="(786) 253-4432"
            />
            <ContactItem
              href="mailto:pascualgabriel0423@gmail.com"
              icon={<Mail size={18} />}
              label="pascualgabriel0423@gmail.com"
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ––––– helper component ––––– */
function ContactItem({ href, icon, label }) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2 text-base hover:text-glacier transition cursor-pointer"
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}
