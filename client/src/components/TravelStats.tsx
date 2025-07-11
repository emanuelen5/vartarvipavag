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

  // Calculate unique countries
  const getUniqueCountries = (): string[] => {
    const countries = positions
      .map(pos => pos.country)
      .filter((country): country is string => Boolean(country));
    return Array.from(new Set(countries));
  };

  // Calculate unique cities
  const getUniqueCities = (): string[] => {
    const cities = positions
      .map(pos => pos.city)
      .filter((city): city is string => Boolean(city));
    return Array.from(new Set(cities));
  };

  // Calculate total notes
  const getTotalNotes = (): number => {
    return positions.reduce((total, pos) => total + (pos.notes?.length || 0), 0);
  };

  // Get notes by source
  const getNotesBySource = (): { telegram: number; homeAssistant: number; manual: number } => {
    const counts = { telegram: 0, homeAssistant: 0, manual: 0 };
    positions.forEach(pos => {
      pos.notes?.forEach(note => {
        if (note.source === 'telegram') counts.telegram++;
        else if (note.source === 'home_assistant') counts.homeAssistant++;
        else counts.manual++;
      });
    });
    return counts;
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

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const totalDistance = calculateTotalDistance();
  const uniqueCountries = getUniqueCountries();
  const uniqueCities = getUniqueCities();
  const journeyDuration = getJourneyDuration();
  const totalNotes = getTotalNotes();
  const notesBySource = getNotesBySource();

  if (positions.length === 0) {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>✨ Journey Statistics</h3>
          <p>No positions tracked yet. Soon the interrail adventure will begin!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>🛤️ Total Distance</h3>
        <p className="value">{totalDistance.toFixed(1)}</p>
        <p className="label">kilometers</p>
      </div>
      
      <div className="stat-card">
        <h3>🇪🇺 Countries Visited</h3>
        <p className="value">{uniqueCountries.length}</p>
        <p className="label">
          {uniqueCountries.length > 0 ? uniqueCountries.join(', ') : 'None yet'}
        </p>
      </div>
      
      <div className="stat-card">
        <h3>🏙️ Cities Visited</h3>
        <p className="value">{uniqueCities.length}</p>
        <p className="label">
          {uniqueCities.length > 0 ? 
            uniqueCities.slice(0, 3).join(', ') + (uniqueCities.length > 3 ? '...' : '') : 
            'None yet'
          }
        </p>
      </div>
      
      <div className="stat-card">
        <h3>📅 Journey Duration</h3>
        <p className="value">{journeyDuration}</p>
        <p className="label">
          {journeyDuration === 1 ? 'day' : 'days'}
          {journeyDuration > 0 && (
            <span style={{ display: 'block', fontSize: '0.8em', marginTop: '0.25rem' }}>
              {new Date(positions[0].timestamp).toLocaleDateString()} - {new Date(positions[positions.length - 1].timestamp).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>
      
      <div className="stat-card">
        <h3>📍 Total Positions</h3>
        <p className="value">{positions.length}</p>
        <p className="label">tracked locations</p>
      </div>
      
      <div className="stat-card">
        <h3>⚡ Average Speed</h3>
        <p className="value">
          {journeyDuration > 0 ? (totalDistance / journeyDuration).toFixed(1) : '0.0'}
        </p>
        <p className="label">km/day</p>
      </div>
      
      <div className="stat-card">
        <h3>💬 Travel Notes</h3>
        <p className="value">{totalNotes}</p>
        <p className="label">
          {notesBySource.telegram > 0 && `📱 ${notesBySource.telegram} from Telegram`}
          {notesBySource.telegram > 0 && (notesBySource.homeAssistant > 0 || notesBySource.manual > 0) && <br />}
          {notesBySource.homeAssistant > 0 && `🏠 ${notesBySource.homeAssistant} from Home Assistant`}
          {notesBySource.homeAssistant > 0 && notesBySource.manual > 0 && <br />}
          {notesBySource.manual > 0 && `✏️ ${notesBySource.manual} manual`}
          {totalNotes === 0 && 'Start adding notes!'}
        </p>
      </div>
    </div>
  );
};

export default TravelStats; 