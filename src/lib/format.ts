/**
 * Formata a data de um evento (ISO) como dd/mm/aaaa.
 * Usa a parte da string em vez de `new Date()` para o fuso horário do aparelho
 * não "voltar" a data em um dia (meia-noite UTC vira o dia anterior no Brasil).
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
