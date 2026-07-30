"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedIcon from "@/components/ui/AnimatedIcon";
import { useUserContext } from "@/components/(base)/providers/UserProvider";

import {
  User as UserIcon,
  Fingerprint,
  ScanFace,
  KeyRound,
} from "lucide-react";

type Module = {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  href: string;
  allowedRoles?: string[];
  requiresAdmin?: boolean;
  colSpan: string;
};

const MODULES: Module[] = [
  {
    id: "proyectos",
    title: "Gestión de",
    subtitle: "Proyectos",
    desc: "Administración, control financiero y seguimiento del estado de los proyectos.",
    icon: "qikuvfgb",
    href: "/kore/proyectos",
    allowedRoles: ["super", "admin", "proyectos"],
    colSpan: "md:col-span-1",
  },
  {
    id: "clientes",
    title: "Gestión de",
    subtitle: "Clientes",
    desc: "Administración de clientes y contactos de la empresa.",
    icon: "zdwrqfmb",
    href: "/kore/clientes",
    allowedRoles: ["super", "admin", "proyectos"],
    colSpan: "md:col-span-1",
  },
  {
    id: "finanzas",
    title: "Módulo de",
    subtitle: "Finanzas",
    desc: "Administración de gastos, métricas y control de flujo de caja.",
    icon: "pimvysaa",
    href: "/kore/finanzas",
    allowedRoles: ["super", "admin", "finanzas"],
    colSpan: "md:col-span-1",
  },
];

export function Dashboard() {
  const { user, effectiveRole } = useUserContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isSuperOrAdmin = ["super", "admin"].includes(effectiveRole);

  const visibleModules = MODULES.filter((mod) => {
    if (mod.requiresAdmin && !isSuperOrAdmin) return false;
    if (mod.allowedRoles && !mod.allowedRoles.includes(effectiveRole))
      return false;
    return true;
  });

  const handleCardClick = (id: string, href: string) => {
    if (isMobile) {
      if (activeId === id) {
        router.push(href);
      } else {
        setActiveId(id);
      }
    } else {
      router.push(href);
    }
  };

  const renderCardsGrid = () => {
    const sortedModules = isMobile
      ? [...visibleModules].sort((a, b) => {
          const order = ["proyectos", "clientes", "finanzas"];
          return order.indexOf(a.id) - order.indexOf(b.id);
        })
      : visibleModules;

    return (
      <div className="relative p-3 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-200 dark:border-red-500/15 bg-white/40 dark:bg-black/30 backdrop-blur-md shadow-2xl overflow-hidden w-full mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(183,73,78,0.12),rgba(0,0,0,0))] pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full relative z-10">
          {sortedModules.map((mod, index) => {
          const isActive = isMobile && activeId === mod.id;
          const isModuleActive = isActive;

          const isWide = mod.colSpan.includes("col-span-2") || mod.colSpan.includes("col-span-3");
          const iconContainerSize = isWide ? "size-14 md:size-24 lg:size-32" : "size-12 md:size-16 lg:size-20";
          const animatedIconSize = isWide ? "size-8 md:size-14 lg:size-20" : "size-7 md:size-10 lg:size-12";
          const titleFontSize = isWide ? "text-[14px] md:text-xl lg:text-3xl xl:text-4xl" : "text-[13px] md:text-base lg:text-xl xl:text-2xl";
          const descFontSize = isWide ? "text-[10px] md:text-sm lg:text-base xl:text-lg" : "text-[9px] md:text-xs lg:text-[13px]";
          const paddingClass = isWide ? "px-6 md:px-10 lg:px-12" : "px-4 md:px-5 lg:px-6";
          const gapClass = isWide ? "gap-4 md:gap-8 lg:gap-10" : "gap-3 md:gap-4 lg:gap-5";

          return (
            <motion.div
              key={mod.id}
              className={`cursor-pointer w-full relative h-[150px] md:h-[220px] lg:h-[240px] ${mod.colSpan}`}
              id={`${mod.id}-card`}
              initial="idle"
              whileHover={isMobile ? undefined : "hover"}
              animate={isModuleActive ? "active" : "idle"}
              transition={isMobile ? { duration: 0 } : { type: "tween", duration: 0.2, ease: "easeInOut" }}
              variants={{
                idle: { zIndex: 1 },
                hover: { zIndex: 10 },
                active: { zIndex: 20 },
              }}
            >
                <div
                  onClick={() => handleCardClick(mod.id, mod.href)}
                  className="group flex flex-col border border-red-500 dark:border-red-500/50 overflow-hidden h-full w-full rounded-2xl transition-colors duration-500 cursor-pointer bg-white dark:bg-black backdrop-blur-md hover:border-red-600 dark:hover:border-red-500 hover:shadow-lg hover:shadow-red-600/10 dark:hover:shadow-red-500/10"
                  style={{
                    borderColor: isActive ? "#ef4444" : undefined,
                  }}
                >
                  <div className="w-full h-full flex flex-col justify-center items-center p-0 outline-none relative z-10 rounded-[inherit] overflow-hidden">
                    <motion.div
                      variants={{
                        idle: { scaleY: 0, opacity: 0 },
                        hover: { scaleY: 1, opacity: 1 },
                        active: { scaleY: 1, opacity: 1 },
                      }}
                      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                      className="absolute top-0 left-0 w-full h-[calc(100%-36px)] origin-bottom bg-gradient-to-t from-celeste-kore to-celeste-kore/80 pointer-events-none z-0 rounded-t-[inherit]"
                    />
                    <div className="absolute inset-0 rounded-[inherit] border border-slate-200 dark:border-slate-700/50 pointer-events-none z-20" />
                    <div className="absolute bottom-0 left-0 w-full h-9 flex justify-center items-center z-10">
                      <motion.span
                        variants={{
                          idle: { opacity: 0, y: isMobile ? 0 : 8 },
                          hover: { opacity: 1, y: isMobile ? 0 : 0 },
                          active: { opacity: 1, y: isMobile ? 0 : 0 },
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.25em] transition-colors duration-500 text-slate-900 dark:text-white"
                      >
                        {isActive
                          ? "Toca de nuevo para entrar"
                          : "Haz click para entrar"}
                      </motion.span>
                    </div>
                    <motion.div
                      className={`w-full flex relative z-10 h-full flex-row items-center justify-start ${paddingClass} ${gapClass}`}
                      variants={{
                        idle: { opacity: 1 },
                        hover: { opacity: 1 },
                        active: { opacity: isMobile ? 1 : [1, 0.4, 1] },
                      }}
                      transition={isMobile ? { duration: 0 } : {
                        duration: 1.4,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative z-10 flex justify-center shrink-0">
                        <div className={`${iconContainerSize} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <motion.div
                            variants={{
                              idle: { y: 0 },
                              hover: { y: -24 },
                              active: { y: -24 },
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex items-center justify-center relative"
                          >
                            <div 
                              className="absolute inset-[-6px] bg-white rounded-2xl border border-slate-200/80 shadow-md transition-all duration-500 -z-10 opacity-100 scale-100"
                            />
                            <AnimatedIcon
                              iconKey={mod.icon}
                              target={`#${mod.id}-card`}
                              className={animatedIconSize}
                              speed={1.5}
                              trigger="hover"
                            />
                          </motion.div>
                        </div>
                      </div>
                      <motion.div
                        variants={{
                          idle: { y: 0 },
                          hover: { y: -24 },
                          active: { y: -24 },
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 flex-1 flex flex-col items-start space-y-1 text-left"
                      >
                        <h3 className={`${titleFontSize} font-black tracking-tighter uppercase leading-none w-full break-words md:transition-colors md:duration-500`}>
                          <span
                            className="text-slate-900 dark:text-white group-hover:text-white md:transition-colors md:duration-500"
                            style={{ color: isActive ? "#ffffff" : undefined }}
                          >
                            {mod.title}
                          </span>
                          <br />
                          <span
                            className="text-celeste-kore group-hover:text-white/90 md:transition-colors md:duration-500"
                            style={{
                              color: isActive
                                ? "rgba(255,255,255,0.9)"
                                : undefined,
                            }}
                          >
                            {mod.subtitle}
                          </span>
                        </h3>
                        <p
                          className={`${descFontSize} text-slate-500 dark:text-slate-400 group-hover:text-white/80 font-bold italic leading-tight pr-2 md:transition-colors md:duration-500`}
                          style={{
                            color: isActive ? "rgba(255,255,255,0.8)" : undefined,
                          }}
                        >
                          {mod.desc}
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
            </motion.div>
          );
        })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full flex-1 flex flex-col">
      <div className="flex flex-col md:hidden w-full bg-transparent">
        <div className="w-full px-4 pt-20 pb-20">{renderCardsGrid()}</div>
      </div>

      <div className="hidden md:flex md:flex-col md:flex-1 relative w-full">
        <div className="relative z-10 w-full flex-1 flex flex-col">
          <div className="w-full flex-1 bg-transparent px-8 lg:px-12 pt-20 pb-20 flex flex-col justify-center">
            <div className="w-full max-w-[90vw] xl:max-w-7xl mx-auto">
              {renderCardsGrid()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
