import React, { useState, useEffect } from 'react';
import InterrailMap from './components/InterrailMap';
import TravelStats from './components/TravelStats';
import { Position } from './types';
import PositionService from './services/api';

const App: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Fetch positions from API
  const fetchPositions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Temporarily use fake data for preview
      const fakeData: Position[] = [
        {
          id: '1',
          timestamp: '2024-12-15T10:00:00Z',
          latitude: 59.3293,
          longitude: 18.0686
        },
        {
          id: '2',
          timestamp: '2024-12-16T14:20:00Z',
          latitude: 55.6761,
          longitude: 12.5683
        },
        {
          id: '3',
          timestamp: '2024-12-17T09:15:00Z',
          latitude: 52.5200,
          longitude: 13.4050
        }
      ];
      
      setPositions(fakeData);
      
      // Uncomment this to use real API data instead
      // const data = await PositionService.getAllPositions();
      //setPositions(data);
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

  // Handle position selection
  const handlePositionClick = (position: Position): void => {
    setSelectedPosition(position);
  };

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
              onPositionClick={handlePositionClick}
            />
            <TravelStats positions={positions} />
          </>
        )}

        {selectedPosition && (
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '300px',
              zIndex: 1000
            }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>
              📍 Vald position
            </h4>
            <p><strong>Koordinater:</strong> {selectedPosition.latitude.toFixed(4)}, {selectedPosition.longitude.toFixed(4)}</p>
            <p><strong>Tid:</strong> {new Date(selectedPosition.timestamp).toLocaleString()}</p>
            <button 
              onClick={() => setSelectedPosition(null)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Stäng
            </button>
          </div>
        )}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#666',
        borderTop: '1px solid #eee',
        marginTop: '40px'
      }}>
        <p>En app av Sara & Erasmus</p>
        <p>Drivs av Home Assistant & TypeScript | Kartor av OpenStreetMap</p>
        <p style={{ fontSize: '0.8em', marginTop: '8px' }}>
          Senast uppdaterad: {positions.length > 0 ? 
            new Date(positions[positions.length - 1].timestamp).toLocaleString() : 
            'Ingen data ännu'
          }
        </p>
      </footer>
    </div>
  );
};

export default App; 