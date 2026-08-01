"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  fullScreen?: boolean;
}

const MAX_WIDTHS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
  "7xl": "sm:max-w-7xl",
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SHELL (Core)
// ─────────────────────────────────────────────────────────────────────────────

export function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "md",
  fullScreen = false,
}: ModalShellProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col sm:items-center sm:justify-center">
          {/* Overlay (Desktop: blur, Mobile: solid) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 sm:bg-zinc-700/20 sm:backdrop-blur-sm transition-colors"
          />

          {/* Modal Container */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex flex-col w-full h-[100dvh]",
              !fullScreen && "sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:p-[3px] shadow-xl",
              fullScreen && "sm:h-screen sm:w-screen sm:max-w-none sm:max-h-screen sm:rounded-none",
              !fullScreen && MAX_WIDTHS[maxWidth],
              "overflow-hidden"
            )}
          >
            {/* Animated Border (Desktop Only) */}
            <div
              className="hidden sm:block absolute inset-0 rounded-3xl pointer-events-none opacity-0 sm:opacity-100 transition-opacity"
              style={{
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, #9E7AFF, #FE8BBB, transparent 40%)`,
              }}
            />

            {/* Content Area (Covers the animated border except for the 3px padding) */}
            <div className={cn("relative flex flex-col flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-800", !fullScreen && "sm:rounded-[22px]")}>
              
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4 pt-safe shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <div className="flex flex-col gap-1 pr-4">
                  <h2 className="text-xl font-black text-foreground">{title}</h2>
                  {subtitle && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 -mr-3 -mt-3 rounded-full text-celeste-kore hover:bg-celeste-kore/10 transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-100 dark:bg-zinc-900 custom-scrollbar">
                {children}
              </div>

              {/* Footer */}
              {footer}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const ModalLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-[11px] font-black uppercase tracking-widest text-foreground mb-1.5",
      className
    )}
    {...props}
  />
));
ModalLabel.displayName = "ModalLabel";

export const ModalInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    placeholder="" // Rule: No placeholders
    className={cn(
      "flex h-11 w-full rounded-xl border-2 border-celeste-kore bg-transparent px-4 py-2 text-sm text-foreground shadow-sm transition-all outline-none",
      "focus-visible:ring-4 focus-visible:ring-celeste-kore/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ModalInput.displayName = "ModalInput";

export const ModalTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    placeholder="" // Rule: No placeholders
    className={cn(
      "flex min-h-[80px] w-full rounded-xl border-2 border-celeste-kore bg-transparent px-4 py-3 text-sm text-foreground shadow-sm transition-all outline-none resize-y",
      "focus-visible:ring-4 focus-visible:ring-celeste-kore/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ModalTextarea.displayName = "ModalTextarea";

export const ModalSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border-2 border-celeste-kore bg-transparent px-4 py-2 text-sm text-foreground shadow-sm transition-all outline-none appearance-none cursor-pointer",
      "focus-visible:ring-4 focus-visible:ring-celeste-kore/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
ModalSelect.displayName = "ModalSelect";

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER & ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-5 pb-safe bg-zinc-100 dark:bg-zinc-800 flex justify-center items-center border-t border-border/10", className)}>
      {children}
    </div>
  );
}

export const ModalSubmit = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean; text?: string }
>(({ className, isLoading, text = "Guardar", disabled, ...props }, ref) => (
  <button
    ref={ref}
    type="submit"
    disabled={disabled || isLoading}
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-xl border-2 border-celeste-kore bg-transparent px-8 py-2 text-sm font-black uppercase tracking-widest text-celeste-kore shadow-sm transition-all outline-none cursor-pointer",
      "hover:bg-celeste-kore/10 hover:shadow-md active:scale-95",
      "focus-visible:ring-4 focus-visible:ring-celeste-kore/20",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
      className
    )}
    {...props}
  >
    {isLoading ? (
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : null}
    {text}
  </button>
));
ModalSubmit.displayName = "ModalSubmit";

// ─────────────────────────────────────────────────────────────────────────────
// DESTRUCTIVE CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────

interface ModalConfirmDeleteProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  isDeleting?: boolean;
  confirmText?: string;
  loadingText?: string;
}

export function ModalConfirmDelete({
  onConfirm,
  onCancel,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  isDeleting = false,
  confirmText = "Sí, eliminar",
  loadingText = "Eliminando...",
}: ModalConfirmDeleteProps) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 my-4 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive">
          <Trash2 size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="text-xs font-bold px-4 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isDeleting ? loadingText : confirmText}
        </button>
      </div>
    </div>
  );
}
