import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ArrowLeft } from "lucide-react";
import { translateText } from "../translateText";

const DEFAULT_ZIP = "86001";
const PAGE_STEP = 10;
const MAX_PAGE_SIZE = 500;

/** Org card: address, contact buttons, hours, then resource subcategories. */
function ResourceCard({ resource, showDistance, t }) {
  const hours = resource.Org_Hours?.trim();

  return (
    <Card className="shadow-md">
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
        {resource.providing && (
          <p>
            <b>{t("needhelp.providing")}:</b> {resource.providing}
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

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

  const fetchResources = useCallback(
    async (size) => {
      if (!chosenCategory) return;
      setLoading(true);
      try {
        const zip = zipCode.trim() || DEFAULT_ZIP;
        const response = await axiosInstance.get(
          `/resources/need-help/by-zip?category=${encodeURIComponent(chosenCategory)}&zipcode=${encodeURIComponent(zip)}&pagesize=${size}`
        );
        setResources(response.data.resources);
        setPageSize(size);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    },
    [chosenCategory, zipCode]
  );

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
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const zip = zipCode.trim() || DEFAULT_ZIP;
        const response = await axiosInstance.get(
          `/resources/need-help/by-zip?category=${encodeURIComponent(chosenCategory)}&zipcode=${encodeURIComponent(zip)}&pagesize=${PAGE_STEP}`
        );
        if (!cancelled) {
          setResources(response.data.resources);
          setPageSize(PAGE_STEP);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const onSearch = () => fetchResources(PAGE_STEP);
  const onLoadMore = () => fetchResources(Math.min(pageSize + PAGE_STEP, MAX_PAGE_SIZE));
  const showDistance = Boolean(zipCode?.trim());
  const hasMore = resources.length >= pageSize && pageSize < MAX_PAGE_SIZE;

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
                {t("needhelp.search")}
              </Button>
            </form>
          </Form>
        </div>

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-4">
              {resources?.length === 0 && !loading ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("needhelp.no_results")}</CardTitle>
                    <CardDescription>{t("needhelp.no_resources_found")}</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                resources.slice(0, 3).map((resource) => (
                  <ResourceCard
                    key={resource.Org_Id ?? resource.Org_Name}
                    resource={resource}
                    showDistance={showDistance}
                    t={t}
                  />
                ))
              )}
            </div>

            <div className="relative z-10 w-full h-[300px] md:h-[400px] lg:h-[500px]">
              <MapComponent
                resources={resources}
                mapLabels={mapLabels}
                showDistance={showDistance}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {resources.slice(3).map((resource) => (
              <ResourceCard
                key={resource.Org_Id ?? resource.Org_Name}
                resource={resource}
                showDistance={showDistance}
                t={t}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={onLoadMore} disabled={loading}>
                {t("needhelp.load_more")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
