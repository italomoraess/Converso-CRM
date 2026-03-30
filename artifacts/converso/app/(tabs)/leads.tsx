import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { LeadCard } from "@/components/LeadCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

export default function LeadsScreen() {
  const { leads } = useApp();
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();
  const c = useTheme();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.nome.toLowerCase().includes(q) ||
        l.telefone.includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.origem.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Leads</Text>
        <Text style={[styles.count, { color: c.textSecondary }]}>{leads.length} contatos</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <View style={[styles.searchBar, { backgroundColor: c.background, borderColor: c.border }]}>
          <Feather name="search" size={18} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Buscar por nome, telefone ou origem..."
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            testID="leads-search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LeadCard lead={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.emptyList,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title={search ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
            subtitle={
              search
                ? "Tente outra busca"
                : "Adicione seu primeiro lead tocando no botão abaixo"
            }
            ctaLabel={!search ? "Adicionar Lead" : undefined}
            onCta={!search ? () => router.push("/lead/new") : undefined}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => router.push("/lead/new")} testID="fab-add-lead" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  count: { fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  list: { padding: 16 },
  emptyList: { flex: 1 },
});
