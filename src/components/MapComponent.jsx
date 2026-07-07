import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildMapPopupHtml } from '@/lib/needHelpContact';

// Fix marker icons for production
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

delete L.Icon.Default.prototype._getIconUrl;

// Flagstaff / Sedona area — matches Need Help default ZIP (86001)
const DEFAULT_MAP_CENTER = [35.0, -111.7];
const DEFAULT_MAP_ZOOM = 10;

function orgKey(resource) {
  return resource.Org_Id ?? resource.Org_Name;
}

const MapComponent = ({ resources, mapLabels, showDistance, selectedOrgId, onSelectOrg }) => {
  const mapRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const markersByIdRef = useRef({});
  const onSelectOrgRef = useRef(onSelectOrg);

  onSelectOrgRef.current = onSelectOrg;

  // Init map once
  useEffect(() => {
    mapRef.current = L.map('map').setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    markersLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      markersByIdRef.current = {};
    };
  }, []);

  // Sync markers when results or labels change
  useEffect(() => {
    if (!mapRef.current || !markersLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();
    markersByIdRef.current = {};
    const bounds = [];

    resources
      .filter((resource) => resource.Org_Latitude !== undefined && resource.Org_Longitude !== undefined)
      .forEach((resource) => {
        const lat = resource.Org_Latitude;
        const lng = resource.Org_Longitude;
        const id = orgKey(resource);
        bounds.push([lat, lng]);

        const marker = L.marker([lat, lng]);
        marker.bindPopup(buildMapPopupHtml(resource, mapLabels, showDistance));
        marker.on('click', () => onSelectOrgRef.current?.(id));
        markersByIdRef.current[id] = marker;
        markersLayerGroupRef.current.addLayer(marker);
      });

    if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    } else if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 12);
    }
  }, [resources, mapLabels, showDistance]);

  // Open popup when user selects a card
  useEffect(() => {
    if (!selectedOrgId || !mapRef.current) return;
    const marker = markersByIdRef.current[selectedOrgId];
    if (!marker) return;
    mapRef.current.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();
  }, [selectedOrgId]);

  return <div id="map" style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;
