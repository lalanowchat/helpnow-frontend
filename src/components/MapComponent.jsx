import { useEffect, useRef } from 'react';
import L from 'leaflet';
//import { MapContainer, TileLayer } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

// Fix marker icons for production
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Fix for default marker icons in React-Leaflet ---
// Without this, the default blue markers will appear as broken images.
delete L.Icon.Default.prototype._getIconUrl;

const MapComponent = ({ resources }) => {
  const mapRef = useRef(null);                // Map Reference object
  const markersLayerGroupRef = useRef(null);  // Markers Layer Reference object

  useEffect(() => {

    // This prevents a "Map container is already initialized" error. 
    // Prevents re-initializing a map container, if it has already been initialized
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
    } 
    // Initialize the map centered on Sedona
    mapRef.current = L.map('map').setView([34.857169083978626, -111.76940984502275], 11);

    // Add a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Create a layer group for markers
    markersLayerGroupRef.current = L.layerGroup().addTo(mapRef.current); // 'mapRef.current' is your L.Map instance

    // Update markers when resources change
    if (markersLayerGroupRef.current) {
      markersLayerGroupRef.current.clearLayers();
      resources
      .filter((resource) => resource.Org_Latitude !== undefined && resource.Org_Longitude !== undefined) // Validate lat and lng
      .forEach((resource) => {
        const marker = L.marker([resource.Org_Latitude, resource.Org_Longitude]);
        //console.log("Organz Name: ", resource.Org_Name); console.log("Current Lat: ", resource.Org_Latitude);console.log("Current Lon: ", resource.Org_Longitude); console.log("------------------");   

        marker.bindPopup(
          `<strong>${resource.Org_Name || 'Unknown Name'}</strong><br>${resource.Org_FullAddress || 'Unknown Address'}<br><br>${resource.providing || 'Providing Unknown'}`
        );
        markersLayerGroupRef.current.addLayer(marker);
      });
      markersLayerGroupRef.current.addTo(mapRef.current);
    }

  }, [resources]); //Re-run effect, i.e. update Map UI, if the new coordinates are passed into MapComponent from server API call

  return <div id="map" style={{ height: '500px', width: '100%' }} />;
};

export default MapComponent;
