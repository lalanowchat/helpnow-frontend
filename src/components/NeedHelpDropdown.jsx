import { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/api/axios';
import {
  readCachedNeedHelpCategories,
  refreshNeedHelpCategories,
} from '@/lib/needHelpCategories';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { phoneTelHref, websiteHref } from '@/lib/needHelpContact';

const DEFAULT_ZIP = '86001';
const PAGE_STEP = 10;
const MAX_PAGE_SIZE = 500;

function ResourceCard({ resource, isSelected, onSelect }) {
  const id = resource.Org_Id ?? resource.Org_Name;
  const phone = resource.Org_PhoneNumber?.trim();
  const website = resource.Org_URL?.trim();
  const tel = phone ? phoneTelHref(phone) : null;
  const href = website ? websiteHref(website) : null;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md shrink-0',
        isSelected && 'ring-2 ring-blue-500 shadow-lg'
      )}
      onClick={() => onSelect(id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{resource.Org_Name}</CardTitle>
        <CardDescription className="text-xs">{resource.Org_FullAddress}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs space-y-1 pt-0">
        {phone && tel && (
          <a href={tel} className="block text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
            {phone}
          </a>
        )}
        {website && href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>
            {website}
          </a>
        )}
        {resource.Org_Hours?.trim() && (
          <p className="text-gray-500">{resource.Org_Hours.trim()}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * NeedHelpDropdown
 *
 * A self-contained left panel with a search bar at the top and a scrollable
 * resource list below. Fires onResults + onSelectOrg so the parent can sync
 * the map.
 *
 * Props:
 *   onResults    {function}  — called with resources array on every fetch
 *   onSelectOrg  {function}  — called with orgId when a card is clicked
 *   selectedOrgId {string}   — currently selected org (from map click)
 *   open         {boolean}   — when provided, controls visibility from outside
 *   onOpenChange {function}  — called with next open state when user toggles
 */
export default function NeedHelpDropdown({ onResults, onSelectOrg, selectedOrgId, open, onOpenChange }) {
  const [categories, setCategories] = useState(readCachedNeedHelpCategories() ?? []);
  const [loadingCategories, setLoadingCategories] = useState(!categories.length);
  const [chosenCategory, setChosenCategory] = useState(categories[0] ?? '');
  const [zipCode, setZipCode] = useState(DEFAULT_ZIP);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [pageSize, setPageSize] = useState(PAGE_STEP);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [minimizedInternal, setMinimizedInternal] = useState(false);
  const minimized = open !== undefined ? !open : minimizedInternal;
  const toggleMinimized = () => {
    if (onOpenChange) onOpenChange(!(!open));
    else setMinimizedInternal((m) => !m);
  };
  const resourcesRef = useRef(resources);
  resourcesRef.current = resources;
  const cardRefs = useRef({});

  // Fetch / refresh categories on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await refreshNeedHelpCategories();
        if (cancelled || !data?.length) return;
        setCategories(data);
        setChosenCategory((prev) => (prev && data.includes(prev) ? prev : data[0]));
      } catch {
        // silent – cached list is still usable
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchResources = async (size, { mode = 'replace' } = {}) => {
    if (!chosenCategory) return;
    const isLoadMore = mode === 'loadMore';
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const prevLen = resourcesRef.current.length;
    try {
      const zip = zipCode.trim() || DEFAULT_ZIP;
      const response = await axiosInstance.get(
        `/resources/need-help/by-zip?category=${encodeURIComponent(chosenCategory)}&zipcode=${encodeURIComponent(zip)}&pagesize=${size}`
      );
      const newResources = response.data.resources ?? [];
      setResources(newResources);
      setPageSize(size);
      onResults?.(newResources);
      if (isLoadMore) {
        setReachedEnd(newResources.length <= prevLen || newResources.length < size);
      } else {
        setReachedEnd(newResources.length < size);
      }
    } catch (err) {
      console.error('NeedHelpDropdown fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setReachedEnd(false);
    fetchResources(PAGE_STEP, { mode: 'replace' });
  };

  const handleLoadMore = () =>
    fetchResources(Math.min(pageSize + PAGE_STEP, MAX_PAGE_SIZE), { mode: 'loadMore' });

  // Auto-search when category changes
  useEffect(() => {
    if (chosenCategory) {
      setReachedEnd(false);
      fetchResources(PAGE_STEP, { mode: 'replace' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenCategory]);

  // Scroll selected card into view when map marker is clicked
  useEffect(() => {
    if (!selectedOrgId || !cardRefs.current[selectedOrgId]) return;
    cardRefs.current[selectedOrgId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedOrgId]);

  return (
    <div
      className="absolute top-4 left-[60px] z-[1000] w-80 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
      style={{ maxHeight: minimized ? 'auto' : 'calc(100% - 2rem)' }}
    >

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 px-3 py-3 border-b bg-gray-50 shrink-0"
      >
        <div className="flex-1 min-w-0">
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <select
              value={chosenCategory}
              onChange={(e) => setChosenCategory(e.target.value)}
              className="w-full text-sm font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200 shrink-0" />

        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors duration-150 shrink-0">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
            placeholder="ZIP"
            className="w-14 text-sm text-center text-gray-800 bg-transparent px-1 py-1 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !chosenCategory}
            className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Minimize toggle */}
        <button
          type="button"
          onClick={toggleMinimized}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
        >
          {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </form>

      {/* Results count */}
      {!minimized && (
      <div className="px-3 py-2 border-b bg-gray-50 shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {loading ? 'Searching…' : resources.length > 0 ? `${resources.length} Resources` : 'Resources'}
        </p>
      </div>
      )}

      {/* Resource list */}
      {!minimized && <div className="flex-1 overflow-y-auto">
        {loading && resources.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8 px-4">
            Select a category to see resources
          </p>
        ) : (
          <div className="flex flex-col gap-3 p-3">
            {resources.map((resource) => {
              const id = resource.Org_Id ?? resource.Org_Name;
              return (
                <div key={id} ref={(el) => { if (el) cardRefs.current[id] = el; else delete cardRefs.current[id]; }}>
                  <ResourceCard
                    resource={resource}
                    isSelected={selectedOrgId === id}
                    onSelect={onSelectOrg}
                  />
                </div>
              );
            })}

            {!reachedEnd && resources.length >= pageSize && pageSize < MAX_PAGE_SIZE && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}

            {reachedEnd && resources.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-2">No more results</p>
            )}
          </div>
        )}
      </div>}

    </div>
  );
}
