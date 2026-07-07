import { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/api/axios';
import {
  readCachedNeedHelpCategories,
  refreshNeedHelpCategories,
} from '@/lib/needHelpCategories';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { phoneTelHref, websiteHref } from '@/lib/needHelpContact';

const DEFAULT_ZIP = '86001';
const PAGE_STEP = 10;
const MAX_PAGE_SIZE = 500;

const VARIANTS = {
  needHelp: {
    endpoint: '/resources/need-help/by-zip',
    searchBtn: 'bg-blue-600 hover:bg-blue-700',
    focusBorder: 'focus-within:border-blue-500 focus-within:ring-blue-500',
    cardRing: 'ring-blue-500',
    linkColor: 'text-blue-600',
  },
  wantToHelp: {
    // TODO: replace endpoint with want-to-help once available
    endpoint: '/resources/need-help/by-zip',
    searchBtn: 'bg-emerald-600 hover:bg-emerald-700',
    focusBorder: 'focus-within:border-emerald-500 focus-within:ring-emerald-500',
    cardRing: 'ring-emerald-500',
    linkColor: 'text-emerald-600',
  },
};

function ResourceCard({ resource, isSelected, cardRing, linkColor, onSelect }) {
  const id = resource.Org_Id ?? resource.Org_Name;
  const phone = resource.Org_PhoneNumber?.trim();
  const website = resource.Org_URL?.trim();
  const tel = phone ? phoneTelHref(phone) : null;
  const href = website ? websiteHref(website) : null;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md shrink-0 overflow-hidden',
        isSelected && `ring-2 shadow-lg ${cardRing}`
      )}
      onClick={() => onSelect?.(id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm leading-snug">{resource.Org_Name}</CardTitle>
        <CardDescription className="text-xs">{resource.Org_FullAddress}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs space-y-1 pt-0">
        {phone && tel && (
          <a href={tel} className={cn('block hover:underline w-fit', linkColor)} onClick={(e) => e.stopPropagation()}>
            {phone}
          </a>
        )}
        {website && href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className={cn('block hover:underline truncate w-fit', linkColor)} onClick={(e) => e.stopPropagation()}>
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

/** Shared search bar + resource list used by both desktop and mobile layouts. */
function PanelContent({
  v, categories, loadingCategories, chosenCategory, setChosenCategory,
  zipCode, setZipCode, loading, loadingMore, resources, reachedEnd,
  pageSize, selectedOrgId, cardRefs, onSelectOrg,
  handleSearch, handleLoadMore,
  // desktop-only props
  minimized, toggleMinimized, isDesktop,
}) {
  return (
    <>
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

        <div className={cn('flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 transition-colors duration-150 shrink-0', v.focusBorder)}>
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
            className={cn('flex items-center justify-center w-8 h-8 text-white disabled:opacity-50 transition-colors shrink-0', v.searchBtn)}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Minimize toggle — desktop only */}
        {isDesktop && (
          <button
            type="button"
            onClick={toggleMinimized}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
          >
            {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </form>

      {/* Results count */}
      {(!isDesktop || !minimized) && (
        <div className="px-3 py-2 border-b bg-gray-50 shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {loading ? 'Searching…' : resources.length > 0 ? `${resources.length} Resources` : 'Resources'}
          </p>
        </div>
      )}

      {/* Resource list */}
      {(!isDesktop || !minimized) && (
        <div className="flex-1 overflow-y-auto">
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
                      cardRing={v.cardRing}
                      linkColor={v.linkColor}
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
        </div>
      )}
    </>
  );
}

/**
 * ResourceDropdown
 *
 * Desktop: floating panel (top-left over the map).
 * Mobile:  bottom Sheet that slides up.
 *
 * Props:
 *   variant      {'needHelp'|'wantToHelp'}
 *   onResults    {function}  — called with resources array on every fetch
 *   onSelectOrg  {function}  — called with orgId when a card is clicked
 *   selectedOrgId {string}   — currently selected org (from map click)
 *   open         {boolean}   — controls visibility from outside
 *   onOpenChange {function}  — called with next open state when user toggles
 */
export default function ResourceDropdown({
  variant = 'needHelp',
  onResults,
  onSelectOrg,
  selectedOrgId,
  open,
  onOpenChange,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.needHelp;

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
    if (onOpenChange) onOpenChange(minimized); // minimized=true means currently closed, so pass true to open
    else setMinimizedInternal((m) => !m);
  };

  const resourcesRef = useRef(resources);
  resourcesRef.current = resources;
  const cardRefs = useRef({});

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
        `${v.endpoint}?category=${encodeURIComponent(chosenCategory)}&zipcode=${encodeURIComponent(zip)}&pagesize=${size}`
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
      console.error('ResourceDropdown fetch error:', err);
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

  useEffect(() => {
    if (chosenCategory) {
      setReachedEnd(false);
      fetchResources(PAGE_STEP, { mode: 'replace' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenCategory]);

  useEffect(() => {
    if (!selectedOrgId || !cardRefs.current[selectedOrgId]) return;
    cardRefs.current[selectedOrgId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedOrgId]);

  const sharedProps = {
    v, categories, loadingCategories, chosenCategory, setChosenCategory,
    zipCode, setZipCode, loading, loadingMore, resources, reachedEnd,
    pageSize, selectedOrgId, cardRefs,
    handleSearch, handleLoadMore,
  };

  const handleSelectOrgMobile = (id) => {
    onSelectOrg?.(id);
    toggleMinimized(); // close the sheet after selection
  };

  return (
    <>
      {/* Desktop: floating panel */}
      <div
        className="hidden md:flex absolute top-4 left-[60px] z-[1000] w-80 flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        style={{ maxHeight: minimized ? 'auto' : 'calc(100% - 2rem)' }}
      >
        <PanelContent {...sharedProps} onSelectOrg={onSelectOrg} isDesktop minimized={minimized} toggleMinimized={toggleMinimized} />
      </div>

      {/* Mobile: bottom sheet */}
      <Sheet open={!minimized} onOpenChange={(o) => { if (!o) toggleMinimized(); }}>
        {/* Floating trigger — always visible when sheet is closed */}
        {minimized && (
          <button
            onClick={toggleMinimized}
            className="md:hidden absolute bottom-6 left-4 z-[1000] flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg bg-white text-gray-800 text-sm font-medium border border-gray-200 transition-colors hover:bg-gray-50"
          >
            <Search className="w-4 h-4" />
            {resources.length > 0 ? `${resources.length} Resources` : 'Search Resources'}
          </button>
        )}
        <SheetContent
          side="bottom"
          className="md:hidden flex flex-col rounded-t-2xl p-0 h-[70vh]"
        >
          <div className="mx-auto mt-2 mb-1 w-10 h-1 rounded-full bg-gray-300 shrink-0" />
          <PanelContent {...sharedProps} onSelectOrg={handleSelectOrgMobile} isDesktop={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
