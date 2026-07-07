import { useEffect, useState } from 'react';
import Header from '../components/Header';
import MapComponent from '../components/MapComponent';
import NeedHelpDropdown from '../components/NeedHelpDropdown';
import WantToHelpDropdown from '../components/WantToHelpDropdown';
import { prefetchBackendForNeedHelp } from '@/lib/needHelpCategories';

export default function Home() {
  const [resources, setResources] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'needHelp' | 'wantToHelp' | null

  const closeAll = () => {
    setActiveDropdown(null);
    setResources([]);
    setSelectedOrgId(null);
  };

  useEffect(() => {
    prefetchBackendForNeedHelp();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="HelpNow Inc"
        onNeedHelp={() => setActiveDropdown('needHelp')}
        onWantToHelp={() => setActiveDropdown('wantToHelp')}
        onLogoClick={closeAll}
        activeDropdown={activeDropdown}
      />
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
        {activeDropdown === 'needHelp' && (
          <NeedHelpDropdown
            onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
            onSelectOrg={setSelectedOrgId}
            selectedOrgId={selectedOrgId}
          />
        )}
        {activeDropdown === 'wantToHelp' && (
          <WantToHelpDropdown
            onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
            onSelectOrg={setSelectedOrgId}
            selectedOrgId={selectedOrgId}
          />
        )}
      </div>
    </div>
  );
}
