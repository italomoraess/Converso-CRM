import { useCallback, useState } from "react";
import type { RefreshControlProps } from "react-native";
import type { ColorScheme } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export function useAppRefreshControl(c: ColorScheme): RefreshControlProps {
  const { refreshAll } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  }, [refreshAll]);

  return {
    refreshing,
    onRefresh,
    tintColor: c.tint,
    colors: [c.tint],
    progressBackgroundColor: c.surface,
  };
}
