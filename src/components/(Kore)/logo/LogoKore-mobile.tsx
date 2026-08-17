"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";
import AnimacionLogoKore from "./AnimacionLogoKore";

export default function LogoKoreMobile() {
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
        className="relative select-none cursor-pointer flex items-center justify-center"
        initial="hidden"
        animate="visible"
      >



        <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 w-full px-2 sm:px-6">
          <motion.div variants={logoVariants} className="flex-shrink-0">
            <Image
              src="/kore/kore.png"
              alt="KoreAPP"
              width={150}
              height={150}
              className="w-[90px] sm:w-[110px] h-auto object-contain rounded-xl"
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
