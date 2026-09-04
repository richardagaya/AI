import { Logo } from "@/components/brand/snowflake";
import { pricingUrl, studioUrl } from "@/lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Showcase", href: "/#showcase" },
      { label: "Open studio", href: studioUrl() },
      { label: "Pricing", href: pricingUrl() },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Content policy", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "#" },
      { label: "Status", href: "#" },
      { label: "Report content", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[0.86rem] leading-relaxed text-frost-faint">
              An uncensored AI image studio for anime, fantasy and mature art.
              Built for creators who are done asking permission.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-frost-faint">
                {col.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[0.88rem] text-frost-dim transition-colors hover:text-solar"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-line/60 pt-8 text-[0.74rem] text-frost-faint">
          <p>© {new Date().getFullYear()} minsuro. All characters are fictional.</p>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none block w-full bg-gradient-to-b from-solar/8 to-transparent bg-clip-text text-center text-[19vw] leading-[0.78] font-semibold tracking-[-0.06em] text-transparent select-none"
      >
        minsuro
      </span>
    </footer>
  );
}
