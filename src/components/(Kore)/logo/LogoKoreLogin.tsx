"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import AnimacionLogoKore from "./AnimacionLogoKore";
import { createPortal } from "react-dom";

export default function LogoKoreLogin() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted] = useState(() => typeof window !== "undefined");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullScreen(true);
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1, scale: 1, rotate: 0,
      transition: { type: "spring" as const, stiffness: 50, damping: 16, duration: 2.4 },
    },
  };

  return (
    <>
      <motion.div
        onClick={handleClick}
        whileTap={{ scale: 0.96 }}
        className="relative select-none cursor-pointer flex items-center justify-center w-full mx-auto overflow-hidden"
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-row items-center justify-center gap-4 w-full">
          <motion.div variants={logoVariants} className="flex-shrink-0">
            <Image
              src="/kore/kore.png"
              alt="KoreAPP"
              width={100}
              height={100}
              className="w-[85px] h-auto object-contain rounded-xl"
              priority
            />
          </motion.div>

        </div>
      </motion.div>

      {mounted && createPortal(
        <AnimacionLogoKore isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />,
        document.body
      )}
    </>
  );
}
