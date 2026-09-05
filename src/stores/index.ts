"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, CartItem, Notification } from "@/types";

// ============ Auth Store ============
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  _lastFetched: number;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  fetchUser: (force?: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isInitialized: false,
      _lastFetched: 0,
      setUser: (user) => set({ user, isLoading: false, isInitialized: true, _lastFetched: Date.now() }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch { /* ignore */ }
        set({ user: null, isLoading: false, isInitialized: true, _lastFetched: 0 });
      },
      fetchUser: async (force = false) => {
        // Skip if already fetched within 30 seconds
        if (!force && get()._lastFetched && Date.now() - get()._lastFetched < 30000) {
          set({ isLoading: false, isInitialized: true });
          return;
        }
        try {
          set({ isLoading: true });
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isLoading: false, isInitialized: true, _lastFetched: Date.now() });
          } else {
            set({ user: null, isLoading: false, isInitialized: true, _lastFetched: Date.now() });
          }
        } catch {
          set({ user: null, isLoading: false, isInitialized: true, _lastFetched: Date.now() });
        }
      },
    }),
    {
      name: "pkashop-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
          state.isLoading = false;
        }
      },
    }
  )
);

// ============ Cart Store ============
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  _lastFetched: number;
  setItems: (items: CartItem[]) => void;
  fetchCart: (force?: boolean) => Promise<void>;
  addToCart: (productId: string) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  _lastFetched: 0,
  setItems: (items) => set({ items }),
  fetchCart: async (force = false) => {
    if (!force && get()._lastFetched && Date.now() - get()._lastFetched < 30000 && get().items.length >= 0) {
      if (get()._lastFetched > 0) return;
    }
    try {
      set({ isLoading: true });
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        set({ items: data.items || [], isLoading: false, _lastFetched: Date.now() });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
  addToCart: async (productId) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        await get().fetchCart(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  removeFromCart: async (itemId) => {
    try {
      const res = await fetch(`/api/cart?id=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        set({ items: get().items.filter((i) => i.id !== itemId) });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (res.ok) {
        await get().fetchCart(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}));

// ============ Notification Store ============
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  _lastFetched: number;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  _lastFetched: 0,
  fetchNotifications: async (force = false) => {
    if (!force && get()._lastFetched && Date.now() - get()._lastFetched < 30000) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        set({
          notifications: data.notifications || [],
          unreadCount: data.unreadCount || 0,
          _lastFetched: Date.now(),
        });
      }
    } catch { /* ignore */ }
  },
  markAsRead: async (id) => {
    try {
      await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch { /* ignore */ }
  },
  markAllAsRead: async () => {
    try {
      await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      set({
        notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      });
    } catch { /* ignore */ }
  },
}));

// ============ UI Store ============
interface UIState {
  theme: "light" | "dark";
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  toggleTheme: () => void;
  setMobileMenu: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "light",
  mobileMenuOpen: false,
  searchOpen: false,
  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    set({ theme: newTheme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("theme", newTheme);
    }
  },
  setMobileMenu: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}));
