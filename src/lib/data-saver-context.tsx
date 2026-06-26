import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { dataSaver: boolean; setDataSaver: (v: boolean) => void; toggle: () => void };
const DataSaverContext = createContext<Ctx | undefined>(undefined);

const KEY = "otako-data-saver";

export function DataSaverProvider({ children }: { children: ReactNode }) {
  const [dataSaver, setDataSaverState] = useState(false);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const saved = localStorage.getItem(KEY);
    if (saved === "1") setDataSaverState(true);
  }, []);

  const setDataSaver = (v: boolean) => {
    setDataSaverState(v);
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, v ? "1" : "0");
  };

  return (
    <DataSaverContext.Provider value={{ dataSaver, setDataSaver, toggle: () => setDataSaver(!dataSaver) }}>
      {children}
    </DataSaverContext.Provider>
  );
}

export function useDataSaver() {
  const ctx = useContext(DataSaverContext);
  if (!ctx) throw new Error("useDataSaver must be used inside DataSaverProvider");
  return ctx;
}
