import { formatCurrency } from "./index";

function formatLocalDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type OrcamentoItem = {
  name: string;
  categoryName?: string;
  price: number;
  durationLine?: string;
  description?: string;
};

export type OrcamentoPayload = {
  emitenteLabel: string;
  cliente?: string;
  items: OrcamentoItem[];
  observacoes?: string;
  validadeDias?: number;
};

export function buildOrcamentoText(params: OrcamentoPayload): string {
  const hoje = new Date();
  const linhas: string[] = [];
  linhas.push("ORÇAMENTO");
  linhas.push("────────────────");
  linhas.push(params.emitenteLabel);
  linhas.push(`Emitido em: ${formatLocalDate(hoje)}`);
  if (params.cliente?.trim()) {
    linhas.push(`Cliente: ${params.cliente.trim()}`);
  }
  const dias = params.validadeDias ?? 7;
  if (dias > 0) {
    const ate = new Date(hoje);
    ate.setDate(ate.getDate() + dias);
    linhas.push(`Válido por ${dias} dias (até ${formatLocalDate(ate)})`);
  }
  linhas.push("");
  linhas.push("ITENS");
  params.items.forEach((it, i) => {
    linhas.push(`${i + 1}. ${it.name}`);
    if (it.categoryName) {
      linhas.push(`   Categoria: ${it.categoryName}`);
    }
    linhas.push(`   ${formatCurrency(it.price)}`);
    if (it.durationLine) {
      linhas.push(`   ${it.durationLine}`);
    }
    if (it.description) {
      linhas.push(`   ${it.description}`);
    }
  });
  linhas.push("");
  const total = params.items.reduce((s, x) => s + x.price, 0);
  linhas.push(`TOTAL: ${formatCurrency(total)}`);
  if (params.observacoes?.trim()) {
    linhas.push("");
    linhas.push("Observações:");
    linhas.push(params.observacoes.trim());
  }
  linhas.push("");
  linhas.push("────────────────");
  linhas.push("Gerado pelo Converso CRM");
  return linhas.join("\n");
}

export function buildOrcamentoHtml(params: OrcamentoPayload): string {
  const hoje = new Date();
  const dias = params.validadeDias ?? 7;
  let validadeHtml = "";
  if (dias > 0) {
    const ate = new Date(hoje);
    ate.setDate(ate.getDate() + dias);
    validadeHtml = `<p class="meta"><strong>Validade:</strong> ${dias} dias (até ${escapeHtml(formatLocalDate(ate))})</p>`;
  }
  const clienteHtml = params.cliente?.trim()
    ? `<p class="meta"><strong>Cliente:</strong> ${escapeHtml(params.cliente.trim())}</p>`
    : "";
  const rows = params.items
    .map((it, i) => {
      const sub: string[] = [];
      if (it.categoryName) {
        sub.push(`<span class="muted">${escapeHtml(it.categoryName)}</span>`);
      }
      if (it.durationLine) {
        sub.push(`<span class="small">${escapeHtml(it.durationLine)}</span>`);
      }
      if (it.description) {
        sub.push(`<span class="desc">${escapeHtml(it.description)}</span>`);
      }
      const subBlock = sub.length ? `<div class="sub">${sub.join("<br/>")}</div>` : "";
      return `<tr>
        <td class="num">${i + 1}</td>
        <td class="item">
          <strong>${escapeHtml(it.name)}</strong>
          ${subBlock}
        </td>
        <td class="price">${escapeHtml(formatCurrency(it.price))}</td>
      </tr>`;
    })
    .join("");
  const total = params.items.reduce((s, x) => s + x.price, 0);
  const obsHtml = params.observacoes?.trim()
    ? `<div class="obs"><h3>Observações</h3><p>${escapeHtml(params.observacoes.trim()).replace(/\n/g, "<br/>")}</p></div>`
    : "";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; padding: 36px 40px; font-size: 14px; line-height: 1.45; }
    h1 { font-size: 22px; margin: 0 0 4px 0; letter-spacing: 0.02em; }
    .tag { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 20px; }
    .emitente { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .meta { margin: 4px 0; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb; padding: 10px 8px; }
    th:nth-child(3) { text-align: right; }
    td { vertical-align: top; padding: 12px 8px; border-bottom: 1px solid #f3f4f6; }
    td.num { width: 28px; color: #9ca3af; font-size: 13px; }
    td.price { text-align: right; font-weight: 700; white-space: nowrap; color: #111827; }
    .sub { margin-top: 6px; font-size: 12px; color: #6b7280; line-height: 1.4; }
    .muted { color: #6b7280; }
    .small { display: block; color: #9ca3af; }
    .desc { display: block; margin-top: 4px; color: #4b5563; }
    .total-row { margin-top: 20px; display: flex; justify-content: flex-end; align-items: baseline; gap: 12px; }
    .total-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .total-value { font-size: 22px; font-weight: 700; color: #111827; }
    .obs { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .obs h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin: 0 0 8px 0; }
    .obs p { margin: 0; color: #374151; white-space: pre-wrap; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <p class="tag">Orçamento</p>
  <h1>Proposta comercial</h1>
  <p class="emitente">${escapeHtml(params.emitenteLabel)}</p>
  <p class="meta"><strong>Emitido em:</strong> ${escapeHtml(formatLocalDate(hoje))}</p>
  ${clienteHtml}
  ${validadeHtml}
  <table>
    <thead><tr><th>#</th><th>Item</th><th>Valor</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total-row">
    <span class="total-label">Total</span>
    <span class="total-value">${escapeHtml(formatCurrency(total))}</span>
  </div>
  ${obsHtml}
  <p class="footer">Gerado pelo Converso CRM</p>
</body>
</html>`;
}
