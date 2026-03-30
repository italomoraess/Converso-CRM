const primary = "#1a56db";
const primaryDark = "#1042b8";
const secondary = "#0ea5e9";
const success = "#10b981";
const warning = "#f59e0b";
const danger = "#ef4444";
const lost = "#6b7280";

const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    background: "#f9fafb",
    surface: "#ffffff",
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    tint: primary,
    tintDark: primaryDark,
    secondary,
    success,
    warning,
    danger,
    lost,
    tabIconDefault: "#9ca3af",
    tabIconSelected: primary,
    tabBar: "#ffffff",
    header: "#ffffff",
    kanbanBg: "#f3f4f6",
    tagNew: "#dbeafe",
    tagNewText: "#1d4ed8",
    tagContact: "#fef3c7",
    tagContactText: "#92400e",
    tagProposal: "#ede9fe",
    tagProposalText: "#6d28d9",
    tagNegotiation: "#fce7f3",
    tagNegotiationText: "#9d174d",
    tagWon: "#d1fae5",
    tagWonText: "#065f46",
    tagLost: "#f3f4f6",
    tagLostText: "#374151",
    originInstagram: "#fce7f3",
    originInstagramText: "#9d174d",
    originIndicacao: "#d1fae5",
    originIndicacaoText: "#065f46",
    originTrafego: "#dbeafe",
    originTrafegoText: "#1d4ed8",
    originRua: "#fef3c7",
    originRuaText: "#92400e",
    originOutro: "#f3f4f6",
    originOutroText: "#374151",
    whatsapp: "#25D366",
    skeleton: "#e5e7eb",
  },
};

export type ColorScheme = typeof Colors.light;
export { Colors };
export default Colors;
