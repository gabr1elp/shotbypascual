// src/components/ContactPage.jsx   ← same file name
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

/* ───────── typewriter hook (unchanged) ───────── */
const phrases = ["Get in Touch", "with Gabriel", "right now!"];
function useTypewriter() {
  const [display, setDisplay] = useState("");
  const [pIdx, setPIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const typing = useRef(true);

  useEffect(() => {
    const speed = 70, hold = 1200;
    const tick = () => {
      if (typing.current) {
        if (charIdx < phrases[pIdx].length) {
          setDisplay(phrases[pIdx].slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        } else {
          typing.current = false;
          setTimeout(tick, hold);
        }
      } else {
        if (charIdx > 0) {
          setDisplay(phrases[pIdx].slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        } else {
          typing.current = true;
          setPIdx((pIdx + 1) % phrases.length);
        }
      }
    };
    const id = setTimeout(tick, speed);
    return () => clearTimeout(id);
  }, [charIdx, pIdx]);

  return display;
}

/* ───────── contact page ───────── */
export default function ContactPage() {
  const headline = useTypewriter();
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          message: form.message,
        }),
      });

      if (resp.ok) {
        setStatus("sent");
        setForm({ firstName: "", lastName: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } 
    catch {
      setStatus("error");
    }
  };

  return (
    <section className="px-6 py-2 pt-24 pb-12 lg:px-12 text-mist">
      <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 items-center">
        {/* left column */}
        <div>
          <p className="text-xl font-medium mb-3">
            Just a click away from working together!
          </p>
          <h1 className="font-extrabold text-xl sm:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-brightorange to-mist bg-clip-text text-transparent">
              {headline}&nbsp;
            </span>
            <span className="inline-block w-2 h-10 bg-mist animate-pulse align-bottom" />
          </h1>
        </div>

        {/* right column – form */}
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              value={form.firstName}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3 text-mist bg-tidepool/10 focus:border-tidepool focus:ring-0"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              value={form.lastName}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-4 py-3 text-mist bg-tidepool/10 focus:border-tidepool focus:ring-0"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-mist bg-tidepool/10 focus:border-tidepool focus:ring-0"
          />

          <textarea
            name="message"
            rows="6"
            placeholder="Message"
            required
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-mist bg-tidepool/10 focus:border-tidepool focus:ring-0"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="mx-auto flex items-center justify-center gap-2 rounded-full
                       bg-gradient-to-r from-glacier to-bdblue px-10 py-3 text-lg
                       font-semibold text-obsidian shadow-lg hover:opacity-90 cursor-pointer"
          >
            <Send size={18} />
            {status === "sending" ? "Sending…" : "Send"}
          </button>

          {status === "sent" && (
            <p className="text-center text-sm text-glacier">
              Thank you! Check your inbox for confirmation.
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-brightorange">
              Something went wrong. Please try again later.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
