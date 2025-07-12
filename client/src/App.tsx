import React, { useState, useEffect } from 'react';
import InterrailMap from './components/InterrailMap';
import TravelStats from './components/TravelStats';
import { Position } from './types';
import { PositionService } from './services/api';
import { fakeInterrailData } from './data/fakeData';

const App: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch positions from API
  const fetchPositions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // If local, use fake data, otherwise use API
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        console.log('Using fake data');
        const data = fakeInterrailData;
        setPositions(data);
      } else {
        console.log('Using API');
        const data = await PositionService.getAllPositions();
        setPositions(data);
      }
      
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPositions();
  }, []);

  // Refresh positions every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle refresh button
  const handleRefresh = (): void => {
    fetchPositions();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Sara & Erasmus</h1>
          <h2>Interrail 2025 🚂</h2>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="error">
            <strong>Fel:</strong> {error}
            <button 
              onClick={handleRefresh}
              style={{
                marginLeft: '10px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Försök igen
            </button>
          </div>
        )}

        {loading && positions.length === 0 ? (
          <div className="loading">
            <div>
              <h3>🔄 Laddar din resa...</h3>
              <p>Hämtar positionsdata från servern</p>
            </div>
          </div>
        ) : (
          <>
            <InterrailMap 
              positions={positions} 
            />
            <TravelStats positions={positions} />
          </>
        )}
      </main>

      <footer>
        <p>En app av Sara & Erasmus</p>
        <p>Drivs av Home Assistant & TypeScript | Kartor av OpenStreetMap</p>
      </footer>
    </div>
  );
};

export default App; 