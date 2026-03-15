import { useState, useEffect } from "react";
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
import { ArrowLeft } from "lucide-react";
import { translateText } from "../translateText"; // Import translation function

export default function NeedHelp() {
  const [categories, setCategories] = useState([]);
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const [chosenCategory, setChosenCategory] = useState("");
  const [resources, setResources] = useState([]);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Fetch categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/resources/need-help-categories");
        setCategories(data);

        // Pre-select first category
        if (data.length > 0) {
          setChosenCategory(data[0]); 
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch resources automatically when category is set
  useEffect(() => {
    if (chosenCategory) {
      getResources();
    }
  }, [chosenCategory]);

  // Translate categories when language changes
  useEffect(() => {
    const translateCategories = async () => {
      if (categories.length === 0) return;

      const translated = await Promise.all(
        categories.map(async (category) => {
          return await translateText(category, i18n.language.toUpperCase());
        })
      );

      setTranslatedCategories(translated);
    };

    translateCategories();
  }, [categories, i18n.language]);

  // Form validation schema
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
      zipCode: "",
    },
  });

  // Fetch resources based on category and zip code
  const getResources = async () => {
    try {
      const response = await axiosInstance.get(
        `/resources/need-help/by-zip?category=${chosenCategory}&zipcode=${zipCode}`
      );
      setResources(response.data.resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
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
        {/* Information Section */}
        {/* <p className="text-muted-foreground mt-2 mb-4 text-sm md:text-base">
          {t("needhelp.this_search_draws")}{" "}
          <a
            href="https://docs.google.com/spreadsheets/u/1/d/1KMk34XY5dsvVJjAoD2mQUVHYU_Ib6COz6jcGH5uJWDY/htmlview#"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("needhelp.MALAN_resources_table")}
          </a>
        </p> */}

        {/* Form Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(getResources)}
              className="flex flex-col md:flex-row gap-4 w-full items-unset lg:items-end"
            >
              {/* Help Category */}
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

              {/* ZIP Code */}
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

              {/* Search Button */}
              <Button type="submit" className="w-full md:w-auto">
                {t("needhelp.search")}
              </Button>
            </form>
          </Form>
        </div>

  <div className="container max-w-screen-xl mx-auto">
  {/* Two-column layout (Map on Right, Resources on Left) */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
    {/* Resources Column (1fr) */}
    <div className="space-y-4">
      {/* Makes use of the 'optional chaining' operator [?.] to safely check if 'resources' is null or undefined. This prevents errors that would otherwise occur when attempting to access properties or call methods on non-existent values */}
      {/* When using ?. in a property access or method call, the expression will short-circuit and return 'undefined', if the value to the left of '?.' is null or undefined.  This avoids throwing a TypeError */}
      {resources?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("needhelp.no_results")}</CardTitle>
            <CardDescription>{t("needhelp.no_resources_found")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        resources.slice(0, 3).map((resource, index) => ( // Show first 3 resources
          <Card key={index} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{resource.Org_Name}</CardTitle>
                  <br />
                  <CardDescription> {resource.Org_FullAddress} </CardDescription>
                </div>
                {zipCode && (
                  <span className="font-bold text-blue-500">
                    {resource.distance.toFixed(1)} miles
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-left"> <b> providing: </b> {resource.providing} </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>

    {/* Map Column (2fr) */}
    <div className="relative z-10 w-full h-[300px] md:h-[400px] lg:h-[500px]">
      <MapComponent resources={resources} />
    </div>
</div>


  {/* Full-Width Resource Grid After Map Finishes */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
    {resources.slice(3).map((resource, index) => ( // Remaining resources go full-width
      <Card key={index} className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{resource.Org_Name}</CardTitle>
               <br />
              <CardDescription>{resource.Org_FullAddress}</CardDescription>
            </div>
            {zipCode && (
              <span className="font-bold text-blue-500">
                {resource.distance.toFixed(1)} miles
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-left"> <b> providing: </b> {resource.providing} </p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

      </div>
    </>
  );
}
