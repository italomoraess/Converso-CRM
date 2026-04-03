import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { CatalogCategory, CatalogProduct } from "@/types";
import { formatCurrency } from "@/utils";

export default function CatalogoScreen() {
  const { categories, products, addCategory, deleteCategory, addProduct, deleteProduct } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [catModal, setCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [productModal, setProductModal] = useState<{ categoryId: string } | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    price: "",
    duration: "",
    durationUnit: "meses" as "dias" | "meses" | "anos",
    description: "",
  });

  const sections = categories.map((cat) => ({
    category: cat,
    data: products.filter((p) => p.categoryId === cat.id),
  }));

  async function handleAddCategory() {
    if (!catName.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addCategory(catName.trim());
    setCatName("");
    setCatModal(false);
  }

  async function handleDeleteCategory(cat: CatalogCategory) {
    Alert.alert(
      "Excluir categoria",
      `Excluir "${cat.name}" e todos os produtos?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteCategory(cat.id) },
      ]
    );
  }

  async function handleAddProduct() {
    if (!productModal || !prodForm.name.trim() || !prodForm.price.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addProduct({
      categoryId: productModal.categoryId,
      name: prodForm.name.trim(),
      price: parseFloat(prodForm.price.replace(",", ".")) || 0,
      duration: prodForm.duration ? parseInt(prodForm.duration) : undefined,
      durationUnit: prodForm.duration ? prodForm.durationUnit : undefined,
      description: prodForm.description.trim() || undefined,
    });
    setProductModal(null);
    setProdForm({ name: "", price: "", duration: "", durationUnit: "meses", description: "" });
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Catálogo</Text>
        <TouchableOpacity
          style={[styles.addCatBtn, { backgroundColor: c.tint }]}
          onPress={() => setCatModal(true)}
          testID="add-category-btn"
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addCatText}>Categoria</Text>
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <EmptyState
          icon="package"
          title="Catálogo vazio"
          subtitle="Crie categorias e adicione seus produtos e serviços"
          ctaLabel="Nova Categoria"
          onCta={() => setCatModal(true)}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item: CatalogProduct) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 120 : 100 }}
          renderSectionHeader={({ section }) => (
            <View style={[styles.catHeader, { backgroundColor: c.background }]}>
              <View style={styles.catTitleRow}>
                <Text style={[styles.catName, { color: c.text }]}>{section.category.name}</Text>
                <View style={styles.catActions}>
                  <TouchableOpacity
                    style={[styles.catActionBtn, { backgroundColor: c.tint }]}
                    onPress={() => setProductModal({ categoryId: section.category.id })}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCategory(section.category)}>
                    <Feather name="trash-2" size={16} color={c.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              {section.data.length === 0 && (
                <Text style={[styles.emptySecText, { color: c.textMuted }]}>
                  Nenhum produto nesta categoria
                </Text>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.productCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.productTop}>
                <Text style={[styles.productName, { color: c.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.productRight}>
                  <Text style={[styles.productPrice, { color: c.tint }]}>
                    {formatCurrency(item.price)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Excluir produto", `Excluir "${item.name}"?`, [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Excluir", style: "destructive", onPress: () => deleteProduct(item.id) },
                      ]);
                    }}
                  >
                    <Feather name="trash-2" size={15} color={c.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              {item.duration && (
                <Text style={[styles.productDuration, { color: c.textSecondary }]}>
                  Duração: {item.duration} {item.durationUnit}
                </Text>
              )}
              {item.description && (
                <Text style={[styles.productDesc, { color: c.textMuted }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={catModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Nova Categoria</Text>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
              placeholder="Nome da categoria"
              placeholderTextColor={c.textMuted}
              value={catName}
              onChangeText={setCatName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: c.border }]} onPress={() => setCatModal(false)}>
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.tint, borderColor: c.tint }]} onPress={handleAddCategory}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!productModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Novo Produto/Serviço</Text>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
              placeholder="Nome *"
              placeholderTextColor={c.textMuted}
              value={prodForm.name}
              onChangeText={(v) => setProdForm((p) => ({ ...p, name: v }))}
            />
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
              placeholder="Preço (R$) *"
              placeholderTextColor={c.textMuted}
              value={prodForm.price}
              onChangeText={(v) => setProdForm((p) => ({ ...p, price: v }))}
              keyboardType="decimal-pad"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, borderColor: c.border, color: c.text, backgroundColor: c.background }]}
                placeholder="Duração"
                placeholderTextColor={c.textMuted}
                value={prodForm.duration}
                onChangeText={(v) => setProdForm((p) => ({ ...p, duration: v }))}
                keyboardType="number-pad"
              />
              {["dias", "meses", "anos"].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitBtn,
                    { borderColor: c.border },
                    prodForm.durationUnit === u && { backgroundColor: c.tint, borderColor: c.tint },
                  ]}
                  onPress={() => setProdForm((p) => ({ ...p, durationUnit: u as any }))}
                >
                  <Text style={[styles.unitText, { color: prodForm.durationUnit === u ? "#fff" : c.textSecondary }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={c.textMuted}
              value={prodForm.description}
              onChangeText={(v) => setProdForm((p) => ({ ...p, description: v }))}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: c.border }]} onPress={() => setProductModal(null)}>
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: c.tint, borderColor: c.tint }]} onPress={handleAddProduct}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  addCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addCatText: { color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  catHeader: { marginBottom: 8, marginTop: 4 },
  catTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 },
  catName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  catActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  catActionBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emptySecText: { fontSize: 13, fontFamily: "Inter_400Regular", paddingBottom: 8 },
  productCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  productTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  productRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  productName: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium", flex: 1 },
  productPrice: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  productDuration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  productDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  unitBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  unitText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  modalBtnText: { fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
