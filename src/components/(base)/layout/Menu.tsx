"use client";

import type { User } from "@supabase/supabase-js";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import {
  LogIn,
  LogOut,
  ShieldAlert,
  Settings,
  User as UserIcon,
  Fingerprint,
  ChevronRight,
  ChevronDown,
  Building2,
  Smartphone,
  Users,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { AuroraText } from "@/components/ui/aurora-text";
import { PushNotificationToggle } from "@/components/ui/PushNotificationToggle";
import { useState } from "react";
import VerPerfil from "@/components/(base)/(users)/profile/VerPerfil";
import PassKeysModal from "@/components/(base)/layout/modals/PassKeysModal";

interface MenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
}

export default function Menu({ isOpen, setIsOpen, user }: MenuProps) {
  const pathname = usePathname();
  const { realRole, effectiveRole, simulatedRole, setSimulatedRole } = useUserContext();
  const isRoot = pathname === "/kore";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasskeysOpen, setIsPasskeysOpen] = useState(false);

  const [isMiCuentaOpen, setIsMiCuentaOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // On mobile root: no breadcrumb bar, so menu starts right below header (3.5rem)
  // On mobile subpages: breadcrumb bar exists, so menu starts below header+breadcrumb (~6.5rem) 
  // On desktop (md+): always below header (4rem)
  const mobileTop = isRoot ? "top-14" : "top-[6.5rem]";
  const mobileHeight = isRoot ? "h-[calc(100vh-3.5rem)]" : "h-[calc(100vh-6.5rem)]";

  const metadata = user?.user_metadata || {};
  const username =
    metadata.username || user?.email?.split("@")[0] || "Invitado";

  const handleLogout = async () => {
    setIsOpen(false);
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      background: isDark ? "#000000" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
    });

    if (result.isConfirmed) {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.replace("/login");
    }
  };

  return (
    <>
      <VerPerfil
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userId={null}
      />
      <PassKeysModal
        isOpen={isPasskeysOpen}
        onClose={() => setIsPasskeysOpen(false)}
        user={user}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          `fixed right-0 ${mobileTop} md:top-16 z-50 ${mobileHeight} md:h-[calc(100vh-4rem)] w-full sm:w-100 bg-white dark:bg-background border-l border-border/40 transition-transform duration-500 overflow-y-auto shadow-2xl flex flex-col`,
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          {user ? (
            <div className="flex flex-col text-sm">
              <span className="font-bold leading-tight">{username}</span>
              <span className="text-muted-foreground text-xs font-medium uppercase leading-tight">
                {effectiveRole}
              </span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <PushNotificationToggle />
          </div>
        </div>

        <div className="flex flex-col flex-1 px-6 pb-8">
          {user ? (
            <>
              {realRole === "super" && (
                <div className="mb-6 flex items-center gap-2 bg-celeste-kore/10 border border-celeste-kore/50 p-3 rounded-xl">
                  <ShieldAlert className="size-5 text-celeste-kore shrink-0" />
                  <select
                    value={simulatedRole || ""}
                    onChange={(e) => setSimulatedRole(e.target.value || null)}
                    className="bg-transparent text-xs font-bold text-red-700 outline-none cursor-pointer w-full"
                  >
                    <option value="">Rol Real: {realRole.toUpperCase()}</option>
                    <option value="admin">Simular: ADMIN</option>
                    <option value="proyectos">Simular: DESARROLLADOR</option>
                    <option value="user">Simular: USER</option>
                  </select>
                </div>
              )}


              {/* SECCIÓN MI CUENTA */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 ml-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    MI CUENTA
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "rounded-2xl border transition-all overflow-hidden",
                      isMiCuentaOpen
                        ? "border-purple-500/30 bg-purple-900/10"
                        : "border-transparent dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    )}
                  >
                    <button
                      onClick={() => setIsMiCuentaOpen(!isMiCuentaOpen)}
                      className="flex items-center justify-between px-4 py-3 w-full text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-200 dark:bg-zinc-900/80 p-2.5 rounded-xl">
                          <UserIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase leading-tight">
                            GESTIÓN DE MI PERFIL
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pr-4 mt-0.5">
                            Actualización de credenciales y datos personales del usuario.
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 text-zinc-400 transition-transform shrink-0",
                          isMiCuentaOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>

                    {/* Sub-items for MI CUENTA */}
                    {isMiCuentaOpen && (
                      <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setIsProfileOpen(true);
                          }}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left cursor-pointer"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <UserIcon className="size-3.5 text-purple-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Mi Perfil</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Ver y editar perfil.</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setIsPasskeysOpen(true);
                          }}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left cursor-pointer"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <Key className="size-3.5 text-purple-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Ingreso Seguro</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Administrar dispositivos.</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN ADMINISTRACIÓN */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 ml-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    ADMINISTRACIÓN
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "rounded-2xl border transition-all overflow-hidden",
                      isAdminOpen
                        ? "border-sky-500/30 bg-sky-900/10"
                        : "border-transparent dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    )}
                  >
                    <button
                      onClick={() => setIsAdminOpen(!isAdminOpen)}
                      className="flex items-center justify-between px-4 py-3 w-full text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-200 dark:bg-zinc-900/80 p-2.5 rounded-xl">
                          <Settings className="size-4 text-sky-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-sky-600 dark:text-sky-400 uppercase leading-tight">
                            AJUSTES ADMIN
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pr-4 mt-0.5">
                            Panel de administración del sistema SIGET.
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 text-zinc-400 transition-transform shrink-0",
                          isAdminOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>

                    {/* Sub-items for ADMINISTRACIÓN */}
                    {isAdminOpen && (
                      <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                        <Link
                          href="/kore/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <Building2 className="size-3.5 text-sky-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Organización Administrativa</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Estructura jerárquica institucional.</p>
                          </div>
                        </Link>

                        <Link
                          href="/kore/admin/dispositivos"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <Smartphone className="size-3.5 text-sky-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Dispositivos</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Autorizar o rechazar acceso por dispositivo.</p>
                          </div>
                        </Link>

                        <Link
                          href="/kore/admin/usuarios"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <Users className="size-3.5 text-sky-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Usuarios</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Cuentas, roles y permisos.</p>
                          </div>
                        </Link>

                        <Link
                          href="/kore/admin/configuraciones"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/30 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-all text-left"
                        >
                          <div className="bg-zinc-300 dark:bg-zinc-800 p-2 rounded-lg">
                            <Settings className="size-3.5 text-sky-500" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Configuraciones</h5>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">Ajustes generales y seguridad.</p>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between rounded-xl bg-red-500 dark:bg-red-600 text-white px-5 py-3 text-sm font-bold w-full hover:bg-red-600 dark:hover:bg-red-700 transition-all cursor-pointer mt-4"
                >
                  <span className="text-white">Cerrar Sesión</span>
                  <LogOut className="size-4 rotate-180 text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="mb-8 mt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-bold w-full hover:opacity-90 transition-all"
              >
                <span>Iniciar Sesión</span>
                <LogIn className="size-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer dentro del menú */}
        <div className="mt-auto border-t border-border/30 px-6 py-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              © 2026 KoreAPP
            </p>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 flex items-center gap-1 mt-1">
              Powered by{" "}
              <a
                href="https://www.oscar27jimenez.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer transition-all inline-flex items-center text-zinc-900 dark:text-zinc-100"
              >
                <AuroraText className="text-xs whitespace-nowrap">
                  KoreAPP | Ing. de Software
                </AuroraText>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
