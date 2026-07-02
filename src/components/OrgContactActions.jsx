import { Button } from "@/components/ui/button";
import { phoneTelHref, websiteHref } from "@/lib/needHelpContact";

/** Phone / website as outline buttons (Need Help resource cards). */
export default function OrgContactActions({ phone, website, t }) {
  const trimmedPhone = phone?.trim();
  const trimmedWebsite = website?.trim();
  const tel = trimmedPhone ? phoneTelHref(trimmedPhone) : null;
  const href = trimmedWebsite ? websiteHref(trimmedWebsite) : null;

  if (!tel && !href) return null;

  return (
    <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
      {trimmedPhone && tel && (
        <Button variant="outline" size="sm" asChild>
          <a href={tel}>
            {t("needhelp.call_phone")}: {trimmedPhone}
          </a>
        </Button>
      )}
      {trimmedWebsite && href && (
        <Button variant="outline" size="sm" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-all">
            {t("needhelp.visit_website")}
          </a>
        </Button>
      )}
    </div>
  );
}
