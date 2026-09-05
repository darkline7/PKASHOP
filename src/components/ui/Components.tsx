"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" | "info" | "outline"; className?: string;
}) {
  const v: Record<string, string> = {
    default: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    outline: "border border-border text-foreground",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", v[variant], className)}>{children}</span>;
}

export function Card({ children, className, hover, onClick }: {
  children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", hover && "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer", className)}>
      {children}
    </div>
  );
}

export function Avatar({ src, name, size = "md", className }: {
  src?: string | null; name: string; size?: "sm" | "md" | "lg" | "xl"; className?: string;
}) {
  const s: Record<string, string> = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-lg" };
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", s[size], className)} />;
  return <div className={cn("rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center font-semibold text-white", s[size], className)}>{initials}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

export function StarRating({ rating, size = "sm", interactive, onChange }: {
  rating: number; size?: "sm" | "md"; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const sc = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={cn(sc, star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300", interactive && "cursor-pointer hover:scale-110 transition-transform")}
          onClick={() => interactive && onChange?.(star)} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: {
  isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!isOpen) return null;
  const s: Record<string, string> = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-card rounded-2xl shadow-xl w-full p-6", s[size])}>
        {title && <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">✕</button></div>}
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type = "info", onClose }: {
  message: string; type?: "success" | "error" | "info" | "warning"; onClose: () => void;
}) {
  const c: Record<string, string> = { success: "bg-green-600", error: "bg-red-600", info: "bg-primary-600", warning: "bg-yellow-600" };
  React.useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={cn("fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg flex items-center gap-2", c[type])}>
      {message}<button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
