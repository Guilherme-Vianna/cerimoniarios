export function percent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 100)}%`;
}

export function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function formatInterval(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const days = Math.round(minutes / 1440);
  if (days < 1) return `${Math.round(minutes / 60)} h`;
  if (days < 30) return plural(days, "dia", "dias");
  const months = Math.round(days / 30);
  if (months < 12) return plural(months, "mês", "meses");
  return plural(Math.round(months / 12), "ano", "anos");
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || null;
}
