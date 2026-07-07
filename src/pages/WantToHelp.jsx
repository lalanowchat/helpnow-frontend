import { useEffect, useState } from 'react';
import Header from '../components/Header';
import MapComponent from '../components/MapComponent';
import WantToHelpDropdown from '../components/WantToHelpDropdown';
import { prefetchBackendForNeedHelp } from '@/lib/needHelpCategories';

export default function WantToHelp() {
  const [resources, setResources] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  useEffect(() => {
    prefetchBackendForNeedHelp();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header title="HelpNow Inc" />
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
        <WantToHelpDropdown
          onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
          onSelectOrg={setSelectedOrgId}
          selectedOrgId={selectedOrgId}
        />
      </div>
    </div>
  );
}
