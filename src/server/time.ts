const TIMEZONE = process.env.LEADERBOARD_TIMEZONE || "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const offsetFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, timeZoneName: "longOffset" });

export function localDate(moment: Date) {
  return dateFormatter.format(moment);
}

function offsetMinutes(moment: Date) {
  const name = offsetFormatter.formatToParts(moment).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "-" ? -minutes : minutes;
}

function addDays(isoDate: string, amount: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function weekStart(now: Date) {
  const today = localDate(now);
  const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDays(today, -weekday);
  const naiveMidnight = new Date(`${monday}T00:00:00Z`);
  return new Date(naiveMidnight.getTime() - offsetMinutes(naiveMidnight) * 60_000);
}

export function streakDays(activity: Date[], now: Date) {
  const days = new Set(activity.map(localDate));
  const today = localDate(now);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
