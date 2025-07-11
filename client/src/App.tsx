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
      
      const data = await PositionService.getAllPositions();
      setPositions(data);
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
          <h1>🚂 Interrail Journey Tracker</h1>
          <p>Follow our European adventure in real-time</p>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
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
              Retry
            </button>
          </div>
        )}

        {loading && positions.length === 0 ? (
          <div className="loading">
            <div>
              <h3>🔄 Loading your journey...</h3>
              <p>Fetching position data from the server</p>
            </div>
          </div>
        ) : (
          <>
            <TravelStats positions={positions} />
            <InterrailMap 
              positions={positions} 
              onPositionClick={handlePositionClick}
            />
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
              📍 Selected Position
            </h4>
            <p><strong>City:</strong> {selectedPosition.city || 'Unknown'}</p>
            <p><strong>Country:</strong> {selectedPosition.country || 'Unknown'}</p>
            <p><strong>Time:</strong> {new Date(selectedPosition.timestamp).toLocaleString()}</p>
            {selectedPosition.notes && (
              <p><strong>Notes:</strong> {selectedPosition.notes}</p>
            )}
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
              Close
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
        <p>🌍 Powered by Home Assistant & TypeScript | 🗺️ Maps by OpenStreetMap</p>
        <p style={{ fontSize: '0.8em', marginTop: '8px' }}>
          Last updated: {positions.length > 0 ? 
            new Date(positions[positions.length - 1].timestamp).toLocaleString() : 
            'No data yet'
          }
        </p>
      </footer>
    </div>
  );
};

export default App; 