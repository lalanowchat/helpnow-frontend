import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import MapComponent from '../components/MapComponent';
import ResourceDropdown from '../components/ResourceDropdown';
import { prefetchBackendForNeedHelp } from '@/lib/needHelpCategories';

export default function NeedHelp() {
  const [resources, setResources] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const mapLabels = useMemo(
    () => ({
      phone: t('needhelp.phone'),
      website: t('needhelp.website'),
      hours: t('needhelp.hours'),
      providing: t('needhelp.providing'),
      miles: t('needhelp.miles'),
      distance: t('needhelp.distance'),
      callPhone: t('needhelp.call_phone'),
      visitWebsite: t('needhelp.visit_website'),
      providingUnknown: t('needhelp.providing_unknown'),
      unknownName: t('needhelp.unknown_name'),
      unknownAddress: t('needhelp.unknown_address'),
    }),
    [t, i18n.language]
  );

  useEffect(() => {
    prefetchBackendForNeedHelp();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header title="HelpNow Inc" onNeedHelp={() => setDropdownOpen(true)} />
      <div className="relative flex-1">
        <MapComponent
          resources={resources}
          mapLabels={mapLabels}
          showDistance={true}
          selectedOrgId={selectedOrgId}
          onSelectOrg={setSelectedOrgId}
        />
        <ResourceDropdown
          variant="needHelp"
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
          onSelectOrg={setSelectedOrgId}
          selectedOrgId={selectedOrgId}
        />
      </div>
    </div>
  );
}
