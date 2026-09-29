import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly className?: string;
  readonly children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { readonly href?: undefined };
type LinkProps = CommonProps & { readonly href: string; readonly prefetch?: boolean; readonly "aria-label"?: string; readonly onClick?: () => void };

const classes = (variant: Variant, size: Size, extra?: string) =>
  ["btn", `btn-${variant}`, size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "", extra].filter(Boolean).join(" ");

/** Button or link that looks like a button. `href` renders a Next <Link>. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  if (props.href !== undefined) {
    const { href, prefetch, onClick } = props;
    return (
      <Link href={href} prefetch={prefetch} onClick={onClick} className={classes(variant, size, className)} aria-label={props["aria-label"]}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  void _v; void _s; void _c; void _ch; void _h;
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
