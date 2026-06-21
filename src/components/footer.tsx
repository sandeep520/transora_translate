import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border/60 glass">
      <div className="container flex h-14 items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="ml-auto text-right">
          Developed by{" "}
          <span className="font-medium text-foreground">Sandeep Rathod</span>
        </span>
      </div>
    </footer>
  );
}
