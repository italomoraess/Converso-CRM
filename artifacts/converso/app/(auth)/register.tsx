import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function RegisterScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleRegister() {
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg("Email e senha são obrigatórios.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg("A senha deve ter pelo menos 1 letra maiúscula e 1 número.");
      return;
    }
    if (password !== confirmPass) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, name.trim() || undefined);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setErrorMsg(e.message ?? "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.logoCircle, { backgroundColor: c.tint }]}>
            <Feather name="zap" size={32} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: c.text }]}>Converso</Text>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>
            Comece a gerenciar seus negócios
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>Criar conta</Text>

          {/* Name */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Nome <Text style={{ color: c.textMuted }}>(opcional)</Text></Text>
            <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.background }]}>
              <Feather name="user" size={16} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="João Silva"
                placeholderTextColor={c.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: c.textSecondary }]}>E-mail *</Text>
            <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.background }]}>
              <Feather name="mail" size={16} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="seu@email.com"
                placeholderTextColor={c.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Senha *</Text>
            <View style={[styles.inputRow, { borderColor: c.border, backgroundColor: c.background }]}>
              <Feather name="lock" size={16} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="Mín. 8 chars, 1 maiúscula, 1 número"
                placeholderTextColor={c.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={c.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Confirmar senha *</Text>
            <View style={[
              styles.inputRow,
              { borderColor: confirmPass && confirmPass !== password ? c.danger : c.border, backgroundColor: c.background }
            ]}>
              <Feather name="lock" size={16} color={c.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="Repita a senha"
                placeholderTextColor={c.textMuted}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name={showConfirm ? "eye-off" : "eye"} size={16} color={c.textMuted} />
              </TouchableOpacity>
            </View>
            {confirmPass.length > 0 && confirmPass !== password && (
              <Text style={[styles.hint, { color: c.danger }]}>As senhas não coincidem</Text>
            )}
          </View>

          {/* Error banner */}
          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
              <Feather name="alert-circle" size={14} color="#dc2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: loading ? c.textMuted : c.success }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.btnText}>Criando conta...</Text>
            ) : (
              <>
                <Text style={styles.btnText}>Criar conta</Text>
                <Feather name="check" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: c.textSecondary }]}>
            Já tem uma conta?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: c.tint }]}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
    gap: 20,
  },
  brand: { alignItems: "center", gap: 8, marginBottom: 4 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular" },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },

  fieldWrap: { gap: 5 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputIcon: { width: 16 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: "#dc2626", fontFamily: "Inter_400Regular" },
});
