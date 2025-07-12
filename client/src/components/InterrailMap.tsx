import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Position } from '../types';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom popup styles
const popupStyle = `
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .leaflet-popup-content {
    font-family: 'Courier New', monospace !important;
    font-size: 14px;
    line-height: 1.4;
    margin: 8px 12px;
  }
  .leaflet-popup-close-button {
    font-size: 18px !important;
    line-height: 18px !important;
    width: 24px !important;
    height: 24px !important;
    color: #666 !important;
    font-weight: bold !important;
    padding: 0 !important;
    text-align: center !important;
    top: 6px !important;
    right: 6px !important;
  }
  .leaflet-popup-close-button:hover {
    background-color: #f0f0f0 !important;
    border-radius: 50% !important;
  }
`;

interface InterrailMapProps {
  positions: Position[];
}

const InterrailMap: React.FC<InterrailMapProps> = ({ positions }) => {
  const [map, setMap] = useState<L.Map | null>(null);

  // Europe center coordinates
  const europeCenter: [number, number] = [50.0, 10.0];
  const europeZoom = 4;

  // Create custom marker icon with primary color
  const createMarkerIcon = (size: number = 25) => {
    const primaryColor = '#ae3c40'; // primary color

    return L.divIcon({
      html: `
        <div style="
          background-color: ${primaryColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  const markerIcon = createMarkerIcon();

  // Create polyline coordinates for the journey path
  const polylineCoordinates: [number, number][] = positions.map(pos => [pos.latitude, pos.longitude]);

  // Format date for display in Swedish format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' });
    const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    
    return `${weekday} ${day} ${month}, kl ${time}`;
  };

  // Auto-fit map to show all positions
  useEffect(() => {
    if (map && positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(pos => [pos.latitude, pos.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, positions]);

  // Add custom styles to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = popupStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (positions.length === 0) {
    return (
      <div className="map-container">
        <div className="loading">
          <div style={{ textAlign: 'center' }}>
            <h3>📍 Snart drar vi iväg!</h3>
            <p>Inga positioner spårade ännu.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={europeCenter}
        zoom={europeZoom}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Journey path polyline */}
        {positions.length > 1 && (
          <Polyline
            positions={polylineCoordinates}
            color="#1f2937"
            weight={3}
            opacity={0.7}
            dashArray="4, 8"
          />
        )}
        
        {/* Position markers */}
        {positions.map((position, index) => {
          const isFirst = index === 0;
          const isLast = index === positions.length - 1;
          
          return (
            <Marker
              key={position.id}
              position={[position.latitude, position.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ae3c40' }}>
                    {isFirst ? '🚀 Resans början' : isLast ? '🏁 Nuvarande position' : `📍 Stopp ${index + 1}`}
                  </h4>
                  
                  <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    📅 {formatDate(position.timestamp)}
                  </div>
                  
                  <div style={{ fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    🌍 {position.latitude.toFixed(5)}, {position.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InterrailMap; 