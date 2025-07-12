import React from 'react';
import { Position } from '../types';

interface TravelStatsProps {
  positions: Position[];
}

const TravelStats: React.FC<TravelStatsProps> = ({ positions }) => {
  // Calculate total distance
  const calculateTotalDistance = (): number => {
    if (positions.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const current = positions[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, current.latitude, current.longitude);
    }
    return totalDistance;
  };

  // Calculate distance between two coordinates
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

  // Calculate journey duration
  const getJourneyDuration = (): number => {
    if (positions.length < 2) return 0;
    
    const start = new Date(positions[0].timestamp);
    const end = new Date(positions[positions.length - 1].timestamp);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDistance = calculateTotalDistance();
  const journeyDuration = getJourneyDuration();

  if (positions.length === 0) {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>✨ Resestatistik</h3>
          <p>Inga positioner spårade ännu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>🛤️ Total sträcka</h3>
        <p className="value">{totalDistance.toFixed(1)}</p>
        <p className="label">kilometer</p>
      </div>
      
      <div className="stat-card">
        <h3>📅 Reselängd</h3>
        <p className="value">{journeyDuration}</p>
        <p className="label">
          {journeyDuration === 1 ? 'dag' : 'dagar'}
          {journeyDuration > 0 && (
            <span style={{ display: 'block', fontSize: '0.8em', marginTop: '0.25rem' }}>
              {new Date(positions[0].timestamp).toLocaleDateString()} - {new Date(positions[positions.length - 1].timestamp).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>
      
      <div className="stat-card">
        <h3>📍 Antal positioner</h3>
        <p className="value">{positions.length}</p>
        <p className="label">spårade platser</p>
      </div>
    </div>
  );
};

export default TravelStats; 