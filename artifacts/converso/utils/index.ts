import { FunnelStage, LeadOrigin } from "@/types";
import Colors from "@/constants/colors";

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function getStageBadgeStyle(stage: FunnelStage) {
  const c = Colors.light;
  switch (stage) {
    case "Novo Lead":
      return { bg: c.tagNew, text: c.tagNewText };
    case "Em Contato":
      return { bg: c.tagContact, text: c.tagContactText };
    case "Proposta Enviada":
      return { bg: c.tagProposal, text: c.tagProposalText };
    case "Em Negociação":
      return { bg: c.tagNegotiation, text: c.tagNegotiationText };
    case "Fechado":
      return { bg: c.tagWon, text: c.tagWonText };
    case "Perdido":
      return { bg: c.tagLost, text: c.tagLostText };
    default:
      return { bg: c.tagLost, text: c.tagLostText };
  }
}

export function getOriginBadgeStyle(origin: LeadOrigin) {
  const c = Colors.light;
  switch (origin) {
    case "Instagram":
      return { bg: c.originInstagram, text: c.originInstagramText };
    case "Indicação":
      return { bg: c.originIndicacao, text: c.originIndicacaoText };
    case "Tráfego pago":
      return { bg: c.originTrafego, text: c.originTrafegoText };
    case "Rua":
      return { bg: c.originRua, text: c.originRuaText };
    default:
      return { bg: c.originOutro, text: c.originOutroText };
  }
}

export function getKanbanColumnColor(stage: FunnelStage): string {
  switch (stage) {
    case "Novo Lead": return "#1a56db";
    case "Em Contato": return "#f59e0b";
    case "Proposta Enviada": return "#8b5cf6";
    case "Em Negociação": return "#ec4899";
    case "Fechado": return "#10b981";
    case "Perdido": return "#6b7280";
    default: return "#6b7280";
  }
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
