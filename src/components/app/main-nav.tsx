"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon, type NavIconName } from "./nav-icon";

export type NavItem = { href: string; label: string; icon: NavIconName; badge?: number; also?: string[] };

function useIsActive() {
  const pathname = usePathname();
  return (item: NavItem) =>
    [item.href, ...(item.also ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`));
}

function Badge({ count, className }: { count: number; className: string }) {
  return (
    <span className={`rounded-full bg-primary text-xs font-semibold leading-none text-white ${className}`}>
      <span className="sr-only">, </span>
      {count > 99 ? "99+" : count}
      <span className="sr-only"> pendentes</span>
    </span>
  );
}

export function MainNav({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex gap-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  active ? "bg-primary-soft text-primary" : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <NavIcon name={item.icon} className="size-[18px]" />
                {item.label}
                {item.badge ? <Badge count={item.badge} className="px-2 py-1" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <span
                  className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                    active ? "scale-105 bg-primary-soft" : "scale-100"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.badge ? (
                    <Badge count={item.badge} className="absolute -top-1 right-1 min-w-5 px-1.5 py-0.5 text-center text-[10px]" />
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
