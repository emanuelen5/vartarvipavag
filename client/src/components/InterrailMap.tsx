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

  // Create custom icons for different marker types
  const createMarkerIcon = (type: 'start' | 'end' | 'regular') => {
    const colors = {
      start: '#10b981', // green
      end: '#dc2626',   // red
      regular: '#2563eb' // blue
    };

    const size = type === 'regular' ? 25 : 30;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${colors[type]};
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

  const startIcon = createMarkerIcon('start');
  const endIcon = createMarkerIcon('end');
  const regularIcon = createMarkerIcon('regular');

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
            <h3>🗺️ Your Journey Awaits</h3>
            <p>No positions tracked yet. Start your interrail adventure!</p>
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
            color="#2563eb"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
        
        {/* Position markers */}
        {positions.map((position, index) => {
          const isFirst = index === 0;
          const isLast = index === positions.length - 1;
          
          let icon = regularIcon;
          if (isFirst) icon = startIcon;
          else if (isLast) icon = endIcon;
          
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
              icon={icon}
              eventHandlers={{
                click: () => onPositionClick?.(position),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2563eb' }}>
                    {isFirst ? '🚀 Journey Start' : isLast ? '🏁 Current Position' : `📍 Stop ${index + 1}`}
                  </h4>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong>📅 {formatDate(position.timestamp)}</strong>
                  </div>
                  
                  {position.city && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>🏙️ City:</strong> {position.city}
                    </div>
                  )}
                  
                  {position.country && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>🇪🇺 Country:</strong> {position.country}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666' }}>
                    <strong>🌍 Coordinates:</strong> {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                  </div>
                  
                  {distanceFromPrevious > 0 && (
                    <div style={{ marginBottom: '4px', fontSize: '0.9em', color: '#666' }}>
                      <strong>🛤️ Distance:</strong> {distanceFromPrevious.toFixed(1)} km
                    </div>
                  )}
                  
                  {position.notes && (
                    <div style={{ marginTop: '8px', padding: '4px', background: '#f0f0f0', borderRadius: '4px' }}>
                      <strong>📝 Notes:</strong> {position.notes}
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