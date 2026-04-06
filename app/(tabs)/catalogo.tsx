import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import { SkeletonCatalogo } from "@/components/skeletons/PageSkeletons";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CatalogCategory, CatalogProduct } from "@/types";
import { formatCurrency } from "@/utils";
import { buildOrcamentoHtml, type OrcamentoPayload } from "@/utils/orcamento";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function CatalogoScreen() {
  const { categories, products, addCategory, deleteCategory, addProduct, deleteProduct, loading } = useApp();
  const { user } = useAuth();
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
  const [savingCat, setSavingCat] = useState(false);
  const [savingProd, setSavingProd] = useState(false);

  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteSelectedIds, setQuoteSelectedIds] = useState<string[]>([]);
  const [quoteCliente, setQuoteCliente] = useState("");
  const [quoteObs, setQuoteObs] = useState("");
  const [quoteValidadeDias, setQuoteValidadeDias] = useState("7");
  const [pdfLoading, setPdfLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCatModal(false);
      setCatName("");
      setProductModal(null);
      setProdForm({ name: "", price: "", duration: "", durationUnit: "meses", description: "" });
      setQuoteModal(false);
      setQuoteSelectedIds([]);
      setQuoteCliente("");
      setQuoteObs("");
      setQuoteValidadeDias("7");
      setPdfLoading(false);
    }, [])
  );

  const sections = categories.map((cat) => ({
    category: cat,
    data: products.filter((p) => p.categoryId === cat.id),
  }));

  const categoryById = useMemo(() => {
    const m = new Map<string, CatalogCategory>();
    categories.forEach((cat) => m.set(cat.id, cat));
    return m;
  }, [categories]);

  const quoteTotal = useMemo(() => {
    const set = new Set(quoteSelectedIds);
    return products.filter((p) => set.has(p.id)).reduce((s, p) => s + p.price, 0);
  }, [products, quoteSelectedIds]);

  function toggleQuoteProduct(id: string) {
    setQuoteSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function openQuoteModal() {
    if (products.length === 0) {
      Alert.alert("Catálogo vazio", "Adicione produtos ou serviços antes de gerar um orçamento.");
      return;
    }
    setQuoteSelectedIds([]);
    setQuoteCliente("");
    setQuoteObs("");
    setQuoteValidadeDias("7");
    setQuoteModal(true);
  }

  function buildQuotePayload(): OrcamentoPayload {
    const set = new Set(quoteSelectedIds);
    const chosen = products.filter((p) => set.has(p.id));
    const items = chosen.map((p) => {
      const cat = categoryById.get(p.categoryId);
      const durationLine =
        p.duration && p.durationUnit
          ? `Duração: ${p.duration} ${p.durationUnit}`
          : undefined;
      return {
        name: p.name,
        categoryName: cat?.name,
        price: p.price,
        durationLine,
        description: p.description,
      };
    });
    const dias = parseInt(quoteValidadeDias.replace(/\D/g, ""), 10);
    const validadeDias = Number.isFinite(dias) && dias > 0 ? dias : 7;
    const emitente =
      user?.name?.trim() ? `${user.name.trim()} · Converso` : "Converso CRM";
    return {
      emitenteLabel: emitente,
      cliente: quoteCliente,
      items,
      observacoes: quoteObs,
      validadeDias,
    };
  }

  async function handleExportPdf() {
    if (quoteSelectedIds.length === 0) {
      Alert.alert("Selecione itens", "Marque pelo menos um produto ou serviço no orçamento.");
      return;
    }
    setPdfLoading(true);
    try {
      const html = buildOrcamentoHtml(buildQuotePayload());
      const { uri } = await Print.printToFileAsync({ html });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Orçamento",
          UTI: "com.adobe.pdf",
        });
      } else {
        const opened = await Linking.canOpenURL(uri);
        if (opened) {
          await Linking.openURL(uri);
        } else {
          Alert.alert(
            "PDF gerado",
            "O arquivo foi criado. Use um dispositivo com compartilhamento disponível para enviar o PDF.",
          );
        }
      }
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await addCategory(catName.trim());
      setCatName("");
      setCatModal(false);
    } finally {
      setSavingCat(false);
    }
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
    setSavingProd(true);
    try {
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
    } finally {
      setSavingProd(false);
    }
  }

  if (loading) {
    return <SkeletonCatalogo c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)/home")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text, flex: 1, marginLeft: 12 }]} numberOfLines={1}>
          Catálogo
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.quoteBtn, { borderColor: c.tint }]}
            onPress={openQuoteModal}
            testID="quote-btn"
          >
            <Feather name="file-text" size={18} color={c.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addCatBtn, { backgroundColor: c.tint }]}
            onPress={() => setCatModal(true)}
            testID="add-category-btn"
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addCatText}>Categoria</Text>
          </TouchableOpacity>
        </View>
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
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="height"
          keyboardVerticalOffset={30}
        >
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
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.tint, borderColor: c.tint, opacity: savingCat ? 0.7 : 1 }]}
                onPress={handleAddCategory}
                disabled={savingCat}
              >
                {savingCat ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!productModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="height"
          keyboardVerticalOffset={30}
        >
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
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.tint, borderColor: c.tint, opacity: savingProd ? 0.7 : 1 }]}
                onPress={handleAddProduct}
                disabled={savingProd}
              >
                {savingProd ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={quoteModal} animationType="slide">
        <KeyboardAvoidingView
          style={[styles.quoteRoot, { backgroundColor: c.background }]}
          behavior="height"
          keyboardVerticalOffset={0}
        >
          <View style={[styles.quoteTopBar, { paddingTop: topPad + 8, borderBottomColor: c.border }]}>
            <Text style={[styles.quoteModalTitle, { color: c.text }]}>Novo orçamento</Text>
            <TouchableOpacity
              onPress={() => setQuoteModal(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={26} color={c.text} />
            </TouchableOpacity>
          </View>
          <SectionList
            style={styles.quoteList}
            sections={sections}
            keyExtractor={(item: CatalogProduct) => item.id}
            stickySectionHeadersEnabled={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={styles.quoteForm}>
                <TextInput
                  style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.surface }]}
                  placeholder="Cliente (opcional)"
                  placeholderTextColor={c.textMuted}
                  value={quoteCliente}
                  onChangeText={setQuoteCliente}
                />
                <View style={styles.quoteRow}>
                  <Text style={[styles.quoteLabel, { color: c.textSecondary }]}>Válido por (dias)</Text>
                  <TextInput
                    style={[
                      styles.quoteDiasInput,
                      { borderColor: c.border, color: c.text, backgroundColor: c.surface },
                    ]}
                    value={quoteValidadeDias}
                    onChangeText={setQuoteValidadeDias}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <TextInput
                  style={[
                    styles.input,
                    styles.quoteObsInput,
                    { borderColor: c.border, color: c.text, backgroundColor: c.surface },
                  ]}
                  placeholder="Observações (opcional)"
                  placeholderTextColor={c.textMuted}
                  value={quoteObs}
                  onChangeText={setQuoteObs}
                  multiline
                />
                <Text style={[styles.quoteHint, { color: c.textMuted }]}>Toque nos itens para incluir no orçamento</Text>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View style={[styles.quoteSecHead, { backgroundColor: c.background }]}>
                <Text style={[styles.quoteSecTitle, { color: c.text }]}>{section.category.name}</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const on = quoteSelectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={[styles.quoteItemRow, { backgroundColor: c.surface, borderColor: c.border }]}
                  onPress={() => toggleQuoteProduct(item.id)}
                  activeOpacity={0.75}
                >
                  <Feather name={on ? "check-square" : "square"} size={22} color={on ? c.tint : c.textMuted} />
                  <View style={styles.quoteItemMid}>
                    <Text style={[styles.quoteItemName, { color: c.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={[styles.quoteItemDesc, { color: c.textMuted }]} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.quoteItemPrice, { color: c.tint }]}>{formatCurrency(item.price)}</Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 + insets.bottom }}
          />
          <View
            style={[
              styles.quoteFooter,
              {
                borderTopColor: c.border,
                backgroundColor: c.surface,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <View style={styles.quoteFooterTop}>
              <Text style={[styles.quoteTotalLabel, { color: c.textSecondary }]}>Total</Text>
              <Text style={[styles.quoteTotalValue, { color: c.tint }]}>{formatCurrency(quoteTotal)}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.quotePdfBtn,
                { backgroundColor: c.tint },
                pdfLoading && { opacity: 0.75 },
              ]}
              onPress={handleExportPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="file-text" size={20} color="#fff" />
                  <Text style={styles.quotePdfBtnText}>Gerar PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  quoteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
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
  quoteRoot: { flex: 1 },
  quoteTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  quoteModalTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  quoteList: { flex: 1 },
  quoteForm: { gap: 10, paddingTop: 16, paddingBottom: 8 },
  quoteRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  quoteLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  quoteDiasInput: {
    minWidth: 64,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  quoteObsInput: { minHeight: 72, textAlignVertical: "top" },
  quoteHint: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  quoteSecHead: { paddingTop: 12, paddingBottom: 6 },
  quoteSecTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  quoteItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  quoteItemMid: { flex: 1, minWidth: 0 },
  quoteItemName: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  quoteItemDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  quoteItemPrice: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  quoteFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  quoteFooterTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quoteTotalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  quoteTotalValue: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  quotePdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
    paddingVertical: 16,
  },
  quotePdfBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
