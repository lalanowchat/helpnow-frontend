/** Structured providing lines — shared by ResourceCard and map popup builder. */

import { providingItemLabel } from "@/lib/needHelpContact";

export default function ProvidingItemsList({ items, labels, className = "" }) {
  if (!items?.length) {
    return labels.providingUnknown ? (
      <p className={`text-gray-400 italic ${className}`}>{labels.providingUnknown}</p>
    ) : null;
  }
  return (
    <ul className={`space-y-1 list-none pl-0 ${className}`}>
      {items.map((it, idx) => {
        const label = providingItemLabel(it);
        const key = `${label}-${idx}`;
        return (
          <li key={key} className="text-gray-700 leading-snug">
            {label || labels.providingUnknown}
          </li>
        );
      })}
    </ul>
  );
}
