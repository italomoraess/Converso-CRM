import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Platform } from "react-native";
import { TabMoreDrawer } from "@/components/TabMoreDrawer";

type DrawerMenuContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerMenuContext = createContext<DrawerMenuContextType | null>(null);

export function DrawerMenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const openDrawer = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setVisible(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setVisible(false);
  }, []);

  const value = useMemo(
    () => ({ openDrawer, closeDrawer }),
    [openDrawer, closeDrawer],
  );

  return (
    <DrawerMenuContext.Provider value={value}>
      {children}
      <TabMoreDrawer visible={visible} onClose={closeDrawer} />
    </DrawerMenuContext.Provider>
  );
}

export function useDrawerMenu() {
  const ctx = useContext(DrawerMenuContext);
  if (!ctx) {
    throw new Error("useDrawerMenu must be used within DrawerMenuProvider");
  }
  return ctx;
}
