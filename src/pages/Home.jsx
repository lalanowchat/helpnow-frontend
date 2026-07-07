import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import ResourceDropdown from '../components/ResourceDropdown';
import { prefetchBackendForNeedHelp } from '@/lib/needHelpCategories';

export default function Home() {
  const navigate = useNavigate();
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
        onLogoClick={() => navigate('/')}
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
        {/* needHelp is always mounted so the mobile trigger is visible; open only when active */}
        <ResourceDropdown
          variant="needHelp"
          open={activeDropdown === 'needHelp'}
          onOpenChange={(o) => setActiveDropdown(o ? 'needHelp' : null)}
          onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
          onSelectOrg={setSelectedOrgId}
          selectedOrgId={selectedOrgId}
        />
        {activeDropdown === 'wantToHelp' && (
          <ResourceDropdown
            variant="wantToHelp"
            onResults={(r) => { setResources(r); setSelectedOrgId(null); }}
            onSelectOrg={setSelectedOrgId}
            selectedOrgId={selectedOrgId}
          />
        )}
      </div>
    </div>
  );
}
