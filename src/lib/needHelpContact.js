/** Shared phone/website helpers and structured providing display for Need Help. */

import { translateText } from "@/translateText";

/** Readable label for one providing item (catalog ``label`` or subcategory). */
export function providingItemLabel(item) {
  return (
    item?.displayLabel ??
    item?.label ??
    item?.displaySubcategory ??
    item?.subcategory ??
    ""
  );
}

/** Resolve structured providing lines; empty arrays fall through to fallbacks. */
export function resolveProvidingItems(resource) {
  const fromDisplay = resource?.displayProvidingItems;
  if (fromDisplay?.length) return fromDisplay;
  const fromApi = resource?.providing_items;
  if (fromApi?.length) return fromApi;
  return normalizeProvidingItems(resource);
}

/** Fallback when API returns legacy ``providing`` string only. */
export function normalizeProvidingItems(resource) {
  if (resource?.providing_items?.length) {
    return resource.providing_items;
  }
  if (resource?.providing?.trim()) {
    return resource.providing
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({
        subcategory: label,
        label,
        summary: null,
        hours: null,
      }));
  }
  return [];
}

/** DeepL target code from i18n language tag (e.g. es-MX → ES). */
function deeplTarget(language) {
  return (language || "en").split("-")[0].toUpperCase();
}

/**
 * Translate providing labels for non-English locales.
 * Summaries are not shown in evacuee UI; hours live in ``Org_Hours``.
 */
export async function translateProvidingItems(items, language) {
  if (!items?.length) return [];
  if ((language || "en").startsWith("en")) {
    return items.map((it) => ({
      ...it,
      displayLabel: providingItemLabel(it),
    }));
  }
  const target = deeplTarget(language);
  const out = [];
  for (const it of items) {
    const raw = providingItemLabel(it);
    const displayLabel = raw ? await translateText(raw, target) : raw;
    out.push({ ...it, displayLabel });
  }
  return out;
}

/** Org hours string from the API; translated when locale is not English. */
export async function translateOrgHours(hours, language) {
  if (!hours?.trim()) return hours;
  if ((language || "en").startsWith("en")) return hours.trim();
  return translateText(hours.trim(), deeplTarget(language));
}

export function websiteHref(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function phoneTelHref(phone) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MAP_BTN_STYLE =
  "display:inline-block;margin:4px 6px 0 0;padding:6px 10px;border:1px solid #ccc;border-radius:6px;background:#fff;color:#111;font-size:13px;text-decoration:none;";

function providingItemLines(items, labels) {
  if (!items?.length) {
    return labels.providingUnknown
      ? [`<i>${escapeHtml(labels.providingUnknown)}</i>`]
      : [];
  }
  return items.map((it) => escapeHtml(providingItemLabel(it) || labels.providingUnknown || ""));
}

/**
 * Leaflet popup — org name, address, distance, contact actions, providing list, hours.
 * Providing shows catalog labels only (no import metadata or per-item hours).
 */
export function buildMapPopupHtml(resource, labels, showDistance) {
  const phone = resource.Org_PhoneNumber?.trim();
  const website = resource.Org_URL?.trim();
  const hours = (resource.displayHours ?? resource.Org_Hours)?.trim();
  const tel = phone ? phoneTelHref(phone) : null;
  const href = website ? websiteHref(website) : null;
  const items = resolveProvidingItems(resource);

  const parts = [
    `<strong>${escapeHtml(resource.Org_Name || labels.unknownName)}</strong>`,
    escapeHtml(resource.Org_FullAddress || labels.unknownAddress),
  ];

  if (showDistance && resource.distance != null) {
    parts.push(
      `<b>${escapeHtml(labels.distance)}:</b> ${resource.distance.toFixed(1)} ${escapeHtml(labels.miles)}`
    );
  }

  const actions = [];
  if (phone && tel) {
    actions.push(
      `<a href="${escapeHtml(tel)}" style="${MAP_BTN_STYLE}">${escapeHtml(labels.callPhone)}: ${escapeHtml(phone)}</a>`
    );
  }
  if (website && href) {
    actions.push(
      `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="${MAP_BTN_STYLE}">${escapeHtml(labels.visitWebsite)}</a>`
    );
  }
  if (actions.length) {
    parts.push(actions.join(""));
  }

  const itemLines = providingItemLines(items, labels);
  if (itemLines.length) {
    parts.push(`<b>${escapeHtml(labels.providing)}:</b>`);
    parts.push(...itemLines);
  }

  if (hours) {
    parts.push(`<b>${escapeHtml(labels.hours)}:</b> ${escapeHtml(hours)}`);
  }

  return parts.filter(Boolean).join("<br>");
}
