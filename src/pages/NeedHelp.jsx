import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import MapComponent from "@/components/MapComponent";
import OrgContactActions from "@/components/OrgContactActions";
import { ArrowLeft, Loader2 } from "lucide-react";
import { translateText } from "../translateText";
import { cn } from "@/lib/utils";
import { formatProviding, formatHours } from "@/lib/needHelpContact";

const DEFAULT_ZIP = "86001";
const PAGE_STEP = 10;
const MAX_PAGE_SIZE = 500;

function orgKey(resource) {
  return resource.Org_Id ?? resource.Org_Name;
}

/** Org card: address, contact buttons, hours, then resource subcategories. */
function ResourceCard({ resource, showDistance, t, isSelected, onSelect, cardRef }) {
  const hours = resource.displayHours ?? resource.Org_Hours?.trim();
  const providing = resource.displayProviding ?? resource.providing;

  return (
    <Card
      ref={cardRef}
      className={cn(
        "shadow-md cursor-pointer transition-shadow hover:shadow-lg",
        isSelected && "ring-2 ring-blue-500 shadow-lg"
      )}
      onClick={() => onSelect?.(orgKey(resource))}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{resource.Org_Name}</CardTitle>
            <br />
            <CardDescription>{resource.Org_FullAddress}</CardDescription>
          </div>
          {showDistance && resource.distance != null && (
            <span className="font-bold text-blue-500 whitespace-nowrap">
              {resource.distance.toFixed(1)} {t("needhelp.miles")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="text-left space-y-3">
        <OrgContactActions
          phone={resource.Org_PhoneNumber}
          website={resource.Org_URL}
          t={t}
        />
        {hours && (
          <p>
            <b>{t("needhelp.hours")}:</b> {hours}
          </p>
        )}
        {providing && (
          <p>
            <b>{t("needhelp.providing")}:</b> {providing}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function NeedHelp() {
  const [categories, setCategories] = useState([]);
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [zipCode, setZipCode] = useState(DEFAULT_ZIP);
  const [chosenCategory, setChosenCategory] = useState("");
  const [resources, setResources] = useState([]);
  const [pageSize, setPageSize] = useState(PAGE_STEP);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [translatedSubcategories, setTranslatedSubcategories] = useState({});
  const [translatedHours, setTranslatedHours] = useState({});
  const cardRefs = useRef({});
  const resourcesRef = useRef(resources);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  resourcesRef.current = resources;

  const mapLabels = useMemo(
    () => ({
      phone: t("needhelp.phone"),
      website: t("needhelp.website"),
      hours: t("needhelp.hours"),
      providing: t("needhelp.providing"),
      miles: t("needhelp.miles"),
      distance: t("needhelp.distance"),
      callPhone: t("needhelp.call_phone"),
      visitWebsite: t("needhelp.visit_website"),
      providingUnknown: t("needhelp.providing_unknown"),
      unknownName: t("needhelp.unknown_name"),
      unknownAddress: t("needhelp.unknown_address"),
    }),
    [t, i18n.language]
  );

  const displayResources = useMemo(
    () =>
      resources.map((resource) => ({
        ...resource,
        displayProviding: formatProviding(
          resource.providing,
          translatedSubcategories,
          i18n.language
        ),
        displayHours: formatHours(resource.Org_Hours, translatedHours, i18n.language),
      })),
    [resources, translatedSubcategories, translatedHours, i18n.language]
  );

  const fetchResources = useCallback(
    async (size, { mode = "replace" } = {}) => {
      if (!chosenCategory) return;
      const isLoadMore = mode === "loadMore";
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const prevLen = resourcesRef.current.length;
      try {
        const zip = zipCode.trim() || DEFAULT_ZIP;
        const response = await axiosInstance.get(
          `/resources/need-help/by-zip?category=${encodeURIComponent(chosenCategory)}&zipcode=${encodeURIComponent(zip)}&pagesize=${size}`
        );
        const newResources = response.data.resources;
        setResources(newResources);
        setPageSize(size);
        if (isLoadMore) {
          setReachedEnd(newResources.length <= prevLen || newResources.length < size);
        } else {
          setReachedEnd(newResources.length < size);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [chosenCategory, zipCode]
  );

  const resetResultsState = useCallback(() => {
    setSelectedOrgId(null);
    setReachedEnd(false);
    cardRefs.current = {};
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/resources/need-help-categories");
        setCategories(data);
        if (data.length > 0) {
          setChosenCategory(data[0]);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!chosenCategory) return;
    resetResultsState();
    fetchResources(PAGE_STEP, { mode: "replace" });
    // Refetch only when category changes; ZIP search uses the Search button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenCategory]);

  useEffect(() => {
    const translateCategories = async () => {
      if (categories.length === 0) return;
      const translated = await Promise.all(
        categories.map((category) => translateText(category, i18n.language.toUpperCase()))
      );
      setTranslatedCategories(translated);
    };
    translateCategories();
  }, [categories, i18n.language]);

  useEffect(() => {
    if (i18n.language.startsWith("en") || resources.length === 0) {
      setTranslatedSubcategories({});
      setTranslatedHours({});
      return;
    }
    const uniqueSubs = new Set();
    const uniqueHours = new Set();
    resources.forEach((resource) => {
      resource.providing
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((sub) => uniqueSubs.add(sub));
      const hours = resource.Org_Hours?.trim();
      if (hours) uniqueHours.add(hours);
    });
    let cancelled = false;
    (async () => {
      const lang = i18n.language.toUpperCase();
      const [subEntries, hourEntries] = await Promise.all([
        Promise.all([...uniqueSubs].map(async (sub) => [sub, await translateText(sub, lang)])),
        Promise.all([...uniqueHours].map(async (h) => [h, await translateText(h, lang)])),
      ]);
      if (!cancelled) {
        setTranslatedSubcategories(Object.fromEntries(subEntries));
        setTranslatedHours(Object.fromEntries(hourEntries));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resources, i18n.language]);

  useEffect(() => {
    if (!selectedOrgId || !cardRefs.current[selectedOrgId]) return;
    cardRefs.current[selectedOrgId].scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedOrgId]);

  const formSchema = z.object({
    category: z.string().min(1, { message: "Please select a category" }),
    zipCode: z.string()
      .max(5, "Zip code must be 5 digits")
      .regex(/^\d+$/, "Must contain only numbers")
      .optional()
      .or(z.literal("")),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      zipCode: DEFAULT_ZIP,
    },
  });

  const onSearch = () => {
    resetResultsState();
    fetchResources(PAGE_STEP, { mode: "replace" });
  };
  const onLoadMore = () =>
    fetchResources(Math.min(pageSize + PAGE_STEP, MAX_PAGE_SIZE), { mode: "loadMore" });
  const showDistance = Boolean(zipCode?.trim());
  const hasMore = !reachedEnd && resources.length >= pageSize && pageSize < MAX_PAGE_SIZE;

  const renderResourceCard = (resource) => {
    const id = orgKey(resource);
    return (
      <ResourceCard
        key={id}
        resource={resource}
        showDistance={showDistance}
        t={t}
        isSelected={selectedOrgId === id}
        onSelect={setSelectedOrgId}
        cardRef={(el) => {
          if (el) cardRefs.current[id] = el;
          else delete cardRefs.current[id];
        }}
      />
    );
  };

  const resultsContent = () => {
    if (loading && displayResources.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{t("needhelp.loading")}</p>
        </div>
      );
    }
    if (displayResources.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("needhelp.no_results")}</CardTitle>
            <CardDescription>{t("needhelp.no_resources_found")}</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return displayResources.slice(0, 3).map(renderResourceCard);
  };

  return (
    <>
      <Header title={`HelpNow > ${t("needhelp.need_help")}`} />
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-10 ml-6 mt-3"
      >
        <ArrowLeft className="w-4 h-4" />{t("needhelp.Back")}
      </Button>
      <div className="p-4 container max-w-screen-xl m-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSearch)}
              className="flex flex-col md:flex-row gap-4 w-full items-unset lg:items-end"
            >
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>{t("needhelp.help_category")}</FormLabel>
                    <Select
                      value={chosenCategory}
                      onValueChange={(value) => {
                        setChosenCategory(value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="relative z-11 w-full md:w-[180px]">
                          <SelectValue placeholder={t("needhelp.choose_category")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {translatedCategories.map((category, index) => (
                          <SelectItem key={index} value={categories[index]}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="text-left" style={{ marginBottom: "-8px" }}>
                    <FormLabel>{t("needhelp.zip_code")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          setZipCode(e.target.value);
                          field.onChange(e);
                        }}
                        placeholder={t("needhelp.zip_code")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                {loading && !loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("needhelp.loading")}
                  </>
                ) : (
                  t("needhelp.search")
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            <div className={cn("space-y-4 relative", loading && displayResources.length > 0 && "opacity-60 pointer-events-none")}>
              {resultsContent()}
            </div>

            <div className="relative z-10 w-full h-[300px] md:h-[400px] lg:h-[500px]">
              <MapComponent
                resources={displayResources}
                mapLabels={mapLabels}
                showDistance={showDistance}
                selectedOrgId={selectedOrgId}
                onSelectOrg={setSelectedOrgId}
              />
            </div>
          </div>

          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8",
              loading && displayResources.length > 0 && "opacity-60 pointer-events-none"
            )}
          >
            {displayResources.slice(3).map(renderResourceCard)}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("needhelp.loading_more")}
                  </>
                ) : (
                  t("needhelp.load_more")
                )}
              </Button>
            </div>
          )}

          {reachedEnd && displayResources.length > 0 && (
            <p className="text-center text-muted-foreground mt-8">{t("needhelp.no_more_results")}</p>
          )}
        </div>
      </div>
    </>
  );
}
