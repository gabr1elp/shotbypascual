import { motion } from "framer-motion";
import AboutMeSection from "../components/AboutMe.jsx";

export default function About() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AboutMeSection />
      </motion.div>
      {/* …add more animated sections here the same way */}
    </>
  );
}
