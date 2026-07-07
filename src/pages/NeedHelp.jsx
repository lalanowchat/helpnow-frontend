import { useEffect, useState } from 'react';
import Header from '../components/Header';
import MapComponent from '../components/MapComponent';
import ResourceDropdown from '../components/ResourceDropdown';
import { prefetchBackendForNeedHelp } from '@/lib/needHelpCategories';

export default function NeedHelp() {
  const [resources, setResources] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    prefetchBackendForNeedHelp();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header title="HelpNow Inc" onNeedHelp={() => setDropdownOpen(true)} />
      <div className="relative flex-1">
        <MapComponent
          resources={resources}
          mapLabels={{
            phone: 'Phone',
            website: 'Website',
            hours: 'Hours',
            providing: 'Providing',
            miles: 'miles',
            distance: 'Distance',
            callPhone: 'Call',
            visitWebsite: 'Visit Website',
            providingUnknown: 'Unknown',
            unknownName: 'Unknown',
            unknownAddress: 'Unknown address',
          }}
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
