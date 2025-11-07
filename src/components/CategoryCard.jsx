import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";

export default function CategoryCard({
  title,
  blurb,
  images,
  link,
  interval = 1000,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      interval
    );
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const current = images[index];

  return (
    /* max-w controls overall size, aspect keeps 4×3 */
    <div className="relative aspect-[3/4] w-full max-w-[380px] overflow-hidden rounded-xl shadow-lg">
      <img
        src={current}
        className="h-full w-full object-cover object-center transition-opacity duration-500"
        loading="lazy"
        alt={title}
      />

      {/* <div className="absolute inset-0 bg-gradient-to-t from-obsidian/10 via-obsidian/20 to-transparent" /> */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-obsidian/70 to-transparent pointer-events-none" />

      <div className="absolute bottom-6 left-6 z-10 text-mist">
        <h2 className="text-3xl font-semibold text-left">{title}</h2>
        <p className="mt-1 mb-4 text-sm max-w-xs text-left">{blurb}</p>

        {/* <Link
          to={link}
          className="inline-block rounded bg-mist px-5 py-2 text-obsidian hover:bg-glacier transition"
        >
          See More
        </Link> */}
      </div>
      <div className="absolute bottom-10 right-6 z-10 text-mist">
        <Link
          to={link}
          className="inline-block rounded bg-mist/50 px-5 py-2 text-obsidian hover:bg-glacier transition"
          style={{cursor: "pointer"}}>
          See More
        </Link>
      </div>
    </div>
  );
}
