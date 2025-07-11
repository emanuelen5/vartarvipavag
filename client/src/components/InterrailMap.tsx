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

interface InterrailMapProps {
  positions: Position[];
  onPositionClick?: (position: Position) => void;
}

const InterrailMap: React.FC<InterrailMapProps> = ({ positions, onPositionClick }) => {
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

  // Calculate distances between consecutive positions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto-fit map to show all positions
  useEffect(() => {
    if (map && positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(pos => [pos.latitude, pos.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, positions]);

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
          
          // Calculate distance from previous position
          let distanceFromPrevious = 0;
          if (index > 0) {
            const prevPos = positions[index - 1];
            distanceFromPrevious = calculateDistance(
              prevPos.latitude, prevPos.longitude,
              position.latitude, position.longitude
            );
          }
          
          return (
            <Marker
              key={position.id}
              position={[position.latitude, position.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onPositionClick?.(position),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2563eb' }}>
                    {isFirst ? '🚀 Resans början' : isLast ? '🏁 Nuvarande position' : `📍 Stopp ${index + 1}`}
                  </h4>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong>📅 {formatDate(position.timestamp)}</strong>
                  </div>
                  
                  {position.city && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>🏙️ Stad:</strong> {position.city}
                    </div>
                  )}
                  
                  {position.country && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>🇪🇺 Land:</strong> {position.country}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666' }}>
                    <strong>🌍 Koordinater:</strong> {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                  </div>
                  
                  {distanceFromPrevious > 0 && (
                    <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666' }}>
                      <strong>🛤️ Avstånd:</strong> {distanceFromPrevious.toFixed(1)} km
                    </div>
                  )}
                  
                  {position.notes && position.notes.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <strong>📝 Anteckningar:</strong>
                      {position.notes.map((note, noteIndex) => (
                        <div key={note.id} style={{ 
                          marginTop: '4px', 
                          padding: '4px', 
                          background: note.source === 'telegram' ? '#e3f2fd' : '#f0f0f0', 
                          borderRadius: '4px',
                          fontSize: '0.9em'
                        }}>
                          <div style={{ fontWeight: 'normal' }}>
                            {note.source === 'telegram' && '📱 '}
                            {note.source === 'home_assistant' && '🏠 '}
                            {note.text}
                          </div>
                          <div style={{ fontSize: '0.8em', color: '#666', marginTop: '2px' }}>
                            {new Date(note.timestamp).toLocaleString()}
                            {note.telegram_user && ` • ${note.telegram_user}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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