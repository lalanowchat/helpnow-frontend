import React from 'react';
import { cn } from '@/lib/utils';

/**
 * NavButton — reusable navigation/action button with an optional icon.
 *
 * Props:
 *   label     {string}    — button text
 *   icon      {ReactNode} — icon rendered above the label
 *   onClick   {function}  — click handler (renders a <button>)
 *   href      {string}    — if provided, renders an <a> tag instead
 *   className {string}    — Tailwind classes for color, bg, hover, etc.
 */
export default function NavButton({ label, icon, onClick, href, className }) {
  const base =
    'inline-flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:scale-105 active:scale-95 active:translate-y-0';

  const classes = cn(base, className);

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {icon}
      {label}
    </button>
  );
}
