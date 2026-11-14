export function Avatar({ name, photoUrl, size = "size-9" }: { name: string; photoUrl: string | null; size?: string }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" referrerPolicy="no-referrer" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${size} flex items-center justify-center rounded-full bg-gold-soft text-sm font-semibold text-gold`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
