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

const MapComponent = ({ resources, mapLabels, showDistance }) => {
  const mapRef = useRef(null);
  const markersLayerGroupRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
    }
    mapRef.current = L.map('map').setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    markersLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);

    if (markersLayerGroupRef.current) {
      markersLayerGroupRef.current.clearLayers();
      const bounds = [];

      resources
        .filter((resource) => resource.Org_Latitude !== undefined && resource.Org_Longitude !== undefined)
        .forEach((resource) => {
          const lat = resource.Org_Latitude;
          const lng = resource.Org_Longitude;
          bounds.push([lat, lng]);

          const marker = L.marker([lat, lng]);
          marker.bindPopup(buildMapPopupHtml(resource, mapLabels, showDistance));
          markersLayerGroupRef.current.addLayer(marker);
        });

      if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [24, 24] });
      } else if (bounds.length === 1) {
        mapRef.current.setView(bounds[0], 12);
      }

      markersLayerGroupRef.current.addTo(mapRef.current);
    }
  }, [resources, mapLabels, showDistance]);

  return <div id="map" style={{ height: '500px', width: '100%' }} />;
};

export default MapComponent;
