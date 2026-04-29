"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Ctx = {
  enabled: boolean;
  isAdmin: boolean;
  toggle: () => void;
};

const EditCtx = createContext<Ctx>({
  enabled: false,
  isAdmin: false,
  toggle: () => {},
});

const STORAGE_KEY = "molat-edit-mode";

export function EditModeProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
  }, [isAdmin]);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  return (
    <EditCtx.Provider value={{ enabled: enabled && isAdmin, isAdmin, toggle }}>
      {children}
    </EditCtx.Provider>
  );
}

export function useEditMode(): Ctx {
  return useContext(EditCtx);
}
