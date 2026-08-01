import type { ReactNode, SVGProps } from 'react';

/**
 * Equi icon set — hand-drawn 24px line icons, 1.75 stroke, round caps.
 * Single accent-agnostic color via currentColor; no filled shapes, no emoji.
 */

export type IconName =
  // expense categories (ids match ExpenseCategory)
  | 'food'
  | 'transport'
  | 'utilities'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'other'
  // interface
  | 'plus'
  | 'close'
  | 'arrowRight'
  | 'chevronLeft'
  | 'chevronRight'
  | 'sun'
  | 'moon'
  | 'users'
  | 'flag'
  | 'scale'
  | 'calendar'
  | 'signOut';

const paths: Record<IconName, ReactNode> = {
  /* bowl with steam */
  food: (
    <>
      <path d="M4.5 11.5h15" />
      <path d="M6 11.5a6 6 0 0 0 12 0" />
      <path d="M10 7.5c0-1 .6-1.4 1-2.2" />
      <path d="M14 7.5c0-1 .6-1.4 1-2.2" />
      <path d="M9 20h6" />
      <path d="M12 17.5V20" />
    </>
  ),
  /* car silhouette */
  transport: (
    <>
      <path d="M4.5 16v-2.2a2.3 2.3 0 0 1 2.3-2.3h10.4a2.3 2.3 0 0 1 2.3 2.3V16" />
      <path d="M4.5 16h15" />
      <path d="M7 11.5 8.2 8a1.5 1.5 0 0 1 1.4-1h4.8a1.5 1.5 0 0 1 1.4 1l1.2 3.5" />
      <circle cx="7.8" cy="16" r="1.4" />
      <circle cx="16.2" cy="16" r="1.4" />
    </>
  ),
  /* lightning outline */
  utilities: <path d="M13.2 3 5.5 13h4.6l-1.3 8 7.7-10h-4.6l1.3-8Z" />,
  /* house */
  housing: (
    <>
      <path d="M4 10.8 12 4l8 6.8" />
      <path d="M6.2 9v11h11.6V9" />
      <path d="M10 20v-5.2h4V20" />
    </>
  ),
  /* ticket */
  entertainment: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v1.8a1.8 1.8 0 0 0 0 3.4v1.8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5v-1.8a1.8 1.8 0 0 0 0-3.4V8.5Z" />
      <path d="M14 7v1.8" />
      <path d="M14 11.1v1.8" />
      <path d="M14 15.2V17" />
    </>
  ),
  /* heart */
  health: (
    <path d="M12 19.5S5 15.3 5 10.2A3.7 3.7 0 0 1 12 8.7a3.7 3.7 0 0 1 7 1.5c0 5.1-7 9.3-7 9.3Z" />
  ),
  /* tote bag */
  shopping: (
    <>
      <path d="M5.8 8.2h12.4l-1 11.3H6.8l-1-11.3Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  /* paper plane */
  travel: (
    <>
      <path d="M20.5 4 3.5 10.6l6.6 2.8 2.8 6.6L20.5 4Z" />
      <path d="M10.1 13.4 20.5 4" />
    </>
  ),
  /* open book */
  education: (
    <>
      <path d="M12 6.8C10.7 5.6 8.9 5 6.8 5H4v13h2.8c2.1 0 3.9.6 5.2 1.8 1.3-1.2 3.1-1.8 5.2-1.8H20V5h-2.8c-2.1 0-3.9.6-5.2 1.8Z" />
      <path d="M12 6.8v13" />
    </>
  ),
  /* soft four-point spark */
  other: (
    <path d="M12 4c.5 3.6 1.9 5 5.5 5.5-3.6.5-5 1.9-5.5 5.5-.5-3.6-1.9-5-5.5-5.5C10.1 9 11.5 7.6 12 4Z" />
  ),

  plus: (
    <>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </>
  ),
  close: (
    <>
      <path d="M6.5 6.5l11 11" />
      <path d="M17.5 6.5l-11 11" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </>
  ),
  chevronLeft: <path d="M14.5 6 8.5 12l6 6" />,
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v1.8" />
      <path d="M12 18.7v1.8" />
      <path d="M3.5 12h1.8" />
      <path d="M18.7 12h1.8" />
      <path d="m6 6 1.3 1.3" />
      <path d="m16.7 16.7 1.3 1.3" />
      <path d="m18 6-1.3 1.3" />
      <path d="m7.3 16.7-1.3 1.3" />
    </>
  ),
  moon: <path d="M19.5 13.2A7.8 7.8 0 1 1 10.8 4.5a6.2 6.2 0 0 0 8.7 8.7Z" />,
  users: (
    <>
      <circle cx="9" cy="8.2" r="3" />
      <path d="M3.8 19.5a5.2 5.2 0 0 1 10.4 0" />
      <path d="M15.5 5.6a3 3 0 0 1 0 5.2" />
      <path d="M17.2 14.9a5.2 5.2 0 0 1 3 4.6" />
    </>
  ),
  flag: (
    <>
      <path d="M6.5 20.5V4" />
      <path d="M6.5 4.5h10.4l-2.3 3.8 2.3 3.7H6.5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M8 20h8" />
      <path d="M5 7h14" />
      <path d="m5 7-2.2 5a2.6 2.6 0 0 0 4.4 0L5 7Z" />
      <path d="m19 7-2.2 5a2.6 2.6 0 0 0 4.4 0L19 7Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16" />
      <path d="M8.5 3.5v3" />
      <path d="M15.5 3.5v3" />
    </>
  ),
  signOut: (
    <>
      <path d="M13.5 4.5H7A1.5 1.5 0 0 0 5.5 6v12A1.5 1.5 0 0 0 7 19.5h6.5" />
      <path d="M10.5 12h9" />
      <path d="m16 8.5 3.5 3.5-3.5 3.5" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
