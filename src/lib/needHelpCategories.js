/** Need Help category list: session cache + backend warm-up for Fly cold starts. */

import axiosInstance from "../api/axios";

const CACHE_KEY = "helpnow_need_help_categories_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function readCachedNeedHelpCategories() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { fetchedAt, categories } = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    if (!Array.isArray(categories) || categories.length === 0) return null;
    return categories;
  } catch {
    return null;
  }
}

export function writeCachedNeedHelpCategories(categories) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), categories })
    );
  } catch {
    // sessionStorage unavailable or quota exceeded
  }
}

export async function fetchNeedHelpCategories() {
  const { data } = await axiosInstance.get("/resources/need-help-categories");
  return data;
}

/**
 * Start waking the Fly backend and prefetch categories while the user is on Home.
 * Failures are ignored; Need Help will retry on mount.
 */
export function prefetchBackendForNeedHelp() {
  const baseURL = (axiosInstance.defaults.baseURL ?? "").replace(/\/$/, "");
  if (baseURL) {
    fetch(`${baseURL}/health/ready`).catch(() => {});
  }

  fetchNeedHelpCategories()
    .then((categories) => {
      if (categories?.length) writeCachedNeedHelpCategories(categories);
    })
    .catch(() => {});
}

/**
 * Stale-while-revalidate: show session cache on Need Help, then replace when API responds.
 */
export async function refreshNeedHelpCategories() {
  const fresh = await fetchNeedHelpCategories();
  if (fresh?.length) writeCachedNeedHelpCategories(fresh);
  return fresh;
}
