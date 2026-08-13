import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-ink-soft/80 text-frost text-sm " +
  "placeholder:text-frost-faint outline-none transition-all duration-200 " +
  "focus:border-solar/70 focus:ring-3 focus:ring-solar/12 " +
  "disabled:opacity-50";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-frost-faint",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-12 px-4", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(control, "min-h-28 resize-y p-4 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-12 px-3", className)} {...props} />;
}
