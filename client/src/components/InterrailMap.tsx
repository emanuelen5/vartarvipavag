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

// Custom popup styles and marker layering
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
  
  /* Ensure consistent marker layering */
  .night-stop-marker {
    z-index: 1000 !important;
  }
  .daily-position-marker {
    z-index: 100 !important;
  }
  
  /* Info box styling */
  .map-info-box {
    background: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-family: Courier, Poppins, 'Open Sans', 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 16px;
  }
  
  .map-info-box h4 {
    margin: 0 0 6px 0;
    color: #ae3c40;
    font-size: 16px;
    font-weight: bold;
  }
  
  .map-info-box p {
    margin: 0 0 8px 0;
    color: #1f2937;
  }
  
  .map-info-box button {
    background: none;
    color: #ae3c40;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    text-decoration: underline;
    font-family: inherit;
    transition: color 0.2s;
  }
  
  .map-info-box button:hover {
    color: #8b2c2f;
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

  // Get the latest position (last in array)
  const latestPosition = positions[positions.length - 1];

  // Function to pan to latest marker
  const panToLatestMarker = () => {
    if (map && latestPosition) {
      map.setView([latestPosition.latitude, latestPosition.longitude], 10, {
        animate: true,
        duration: 1.5
      });
    }
  };

  // Create custom marker icons for different position types with unique class names
  const nightStopIcon = React.useMemo(() => L.divIcon({
    html: `
      <div style="
        background-color: #ae3c40;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        z-index: 1000;
        position: relative;
      "></div>
    `,
    className: 'night-stop-marker',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5]
  }), []);

  const dailyPositionIcon = React.useMemo(() => L.divIcon({
    html: `
      <div style="
        background-color:#1f2937;
        opacity=0.7;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 0px solid;
        z-index: 100;
        position: relative;
      "></div>
    `,
    className: 'daily-position-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  }), []);

  // Create polyline coordinates for the journey path
  const polylineCoordinates: [number, number][] = positions.map(pos => [pos.latitude, pos.longitude]);

  // Determine position type from timestamp
  const getPositionType = (timestamp: string): 'night_stop' | 'daily_position' => {
    const date = new Date(timestamp);
    const hour = date.getUTCHours();
    
    // If the hour is 0 (midnight UTC), it's a night stop
    // All other hours are daily positions
    return hour === 0 ? 'night_stop' : 'daily_position';
  };

  // Format date for night stops: "Tis 13 december"
  const formatDateNightStop = (dateString: string): string => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'long' });
    
    return `${weekday} ${day} ${month}`;
  };

  // Format date for daily positions: "Tis kl HH:MM"
  const formatDateDailyPosition = (dateString: string): string => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' });
    const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    
    return `${weekday} kl ${time}`;
  };

  // Format date for info box: "Monday, 13 dec, kl HH:XX"
  const formatDateInfoBox = (dateString: string): string => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('sv-SE', { month: 'short' });
    const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    
    return `${weekday}, ${day} ${month}, kl ${time}`;
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
    <div>
      {/* Info box above map */}
      {latestPosition && (
        <div className="map-info-box">
          <h4>📍 Senaste uppdatering</h4>
          <p>
            {formatDateInfoBox(latestPosition.timestamp)} vid {latestPosition.latitude.toFixed(5)}, {latestPosition.longitude.toFixed(4)} - <button onClick={panToLatestMarker}>Se på karta</button>
          </p>
        </div>
      )}
      
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
            weight={2.5}
            opacity={0.7}
            dashArray="3, 6"
          />
        )}
        
        {/* Position markers - render daily positions first, then night stops on top */}
        {positions.map((position, _) => {
          const positionType = getPositionType(position.timestamp);
          
          // Only render daily positions in this pass
          if (positionType !== 'daily_position') return null;
          
          return (
            <Marker
              key={position.id}
              position={[position.latitude, position.longitude]}
              icon={dailyPositionIcon}
              zIndexOffset={100}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    📆 {formatDateDailyPosition(position.timestamp)}
                  </div>
                  
                  <div style={{ fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    📍 {position.latitude.toFixed(5)}, {position.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Night stop markers - rendered after daily positions to appear on top */}
        {positions.map((position, _) => {
          const positionType = getPositionType(position.timestamp);
          
          // Only render night stops in this pass
          if (positionType !== 'night_stop') return null;
          
          return (
                         <Marker
               key={`night-${position.id}`}
               position={[position.latitude, position.longitude]}
               icon={nightStopIcon}
               zIndexOffset={1000}
             >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ae3c40' }}>
                    🌙 Nattens vila
                  </h4>
                  
                  <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    📆 {formatDateNightStop(position.timestamp)}
                  </div>
                  
                  <div style={{ fontSize: '0.9em', color: '#666', fontWeight: 'bold' }}>
                    📍 {position.latitude.toFixed(5)}, {position.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      </div>
    </div>
  );
};

export default InterrailMap; 