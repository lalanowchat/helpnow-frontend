/** Shared phone/website helpers for Need Help cards and map popups. */

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

/** Leaflet popup HTML — mirrors ResourceCard fields (labels from i18n). */
export function buildMapPopupHtml(resource, labels, showDistance) {
  const phone = resource.Org_PhoneNumber?.trim();
  const website = resource.Org_URL?.trim();
  const hours = resource.Org_Hours?.trim();
  const tel = phone ? phoneTelHref(phone) : null;
  const href = website ? websiteHref(website) : null;

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

  if (hours) {
    parts.push(`<b>${escapeHtml(labels.hours)}:</b> ${escapeHtml(hours)}`);
  }

  parts.push(
    `<b>${escapeHtml(labels.providing)}:</b> ${escapeHtml(resource.providing || labels.providingUnknown)}`
  );

  return parts.filter(Boolean).join("<br>");
}
