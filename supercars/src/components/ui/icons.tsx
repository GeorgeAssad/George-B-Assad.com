import type { SVGProps } from "react";

/* Minimal inline icon set (1.75 stroke, currentColor). Decorative by default. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconCart = (p: IconProps) => (<Icon {...p}><path d="M3 4h2.2l2.1 10.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.76L19.5 8H6.1" /><circle cx="9.5" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></Icon>);
export const IconSearch = (p: IconProps) => (<Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>);
export const IconMenu = (p: IconProps) => (<Icon {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Icon>);
export const IconClose = (p: IconProps) => (<Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>);
export const IconArrow = (p: IconProps) => (<Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>);
export const IconArrowLeft = (p: IconProps) => (<Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>);
export const IconCheck = (p: IconProps) => (<Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>);
export const IconSun = (p: IconProps) => (<Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>);
export const IconMoon = (p: IconProps) => (<Icon {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" /></Icon>);
export const IconChat = (p: IconProps) => (<Icon {...p}><path d="M4 5h16v11H9l-5 4V5Z" /></Icon>);
export const IconShield = (p: IconProps) => (<Icon {...p}><path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></Icon>);
export const IconTruck = (p: IconProps) => (<Icon {...p}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7.5" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></Icon>);
export const IconLock = (p: IconProps) => (<Icon {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Icon>);
export const IconPlay = (p: IconProps) => (<Icon {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></Icon>);
export const IconPlus = (p: IconProps) => (<Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>);
export const IconMinus = (p: IconProps) => (<Icon {...p}><path d="M5 12h14" /></Icon>);
export const IconTrash = (p: IconProps) => (<Icon {...p}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" /></Icon>);
export const IconEdit = (p: IconProps) => (<Icon {...p}><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></Icon>);
export const IconPackage = (p: IconProps) => (<Icon {...p}><path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3ZM4 7.2l8 4.3 8-4.3M12 11.5V21" /></Icon>);
export const IconPalette = (p: IconProps) => (<Icon {...p}><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.3-1-1.5-1-2.7 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4C21 7 17 3 12 3Z" /><circle cx="7.8" cy="11" r=".9" fill="currentColor" /><circle cx="10.5" cy="7.5" r=".9" fill="currentColor" /><circle cx="15" cy="8" r=".9" fill="currentColor" /></Icon>);
export const IconGauge = (p: IconProps) => (<Icon {...p}><path d="M4.5 17a8.5 8.5 0 1 1 15 0M12 13l4-4" /><circle cx="12" cy="13" r="1.2" /></Icon>);
export const IconInstagram = (p: IconProps) => (<Icon {...p}><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.6" cy="7.4" r=".8" fill="currentColor" /></Icon>);
export const IconTikTok = (p: IconProps) => (<Icon {...p}><path d="M14 4v10.2a3.2 3.2 0 1 1-3.2-3.2M14 4c.3 2.2 1.8 3.7 4 3.9" /></Icon>);
export const IconHelp = (p: IconProps) => (<Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.6M12 16.6v.1" /></Icon>);
