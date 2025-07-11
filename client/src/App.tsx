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
      
      /* // Temporarily use fake data for preview
      const fakeData: Position[] = [
        {
          id: '1',
          timestamp: '2024-12-15T10:00:00Z',
          latitude: 59.3293,
          longitude: 18.0686,
          city: 'Stockholm',
          country: 'Sweden',
          source: 'home_assistant',
          notes: [
            {
              id: '1',
              text: 'Starting our amazing interrail journey! 🚂✨',
              timestamp: '2024-12-15T10:30:00Z',
              source: 'manual'
            }
          ]
        },
        {
          id: '2',
          timestamp: '2024-12-16T14:20:00Z',
          latitude: 55.6761,
          longitude: 12.5683,
          city: 'Copenhagen',
          country: 'Denmark',
          source: 'telegram',
          notes: [
            {
              id: '2',
              text: 'The train ride was spectacular! Amazing views of the countryside 🌾',
              timestamp: '2024-12-16T14:30:00Z',
              source: 'telegram',
              telegram_user: 'Sara'
            },
            {
              id: '3',
              text: 'Trying Danish pastries at the station - absolutely delicious! 🥐',
              timestamp: '2024-12-16T15:45:00Z',
              source: 'telegram',
              telegram_user: 'Erasmus'
            }
          ]
        },
        {
          id: '3',
          timestamp: '2024-12-17T09:15:00Z',
          latitude: 52.5200,
          longitude: 13.4050,
          city: 'Berlin',
          country: 'Germany',
          source: 'telegram',
          notes: [
            {
              id: '4',
              text: 'Berlin is incredible! The history here is amazing 🏛️',
              timestamp: '2024-12-17T09:30:00Z',
              source: 'telegram',
              telegram_user: 'Sara'
            },
            {
              id: '5',
              text: 'Brandenburg Gate at sunset was breathtaking',
              timestamp: '2024-12-17T18:22:00Z',
              source: 'manual'
            }
          ]
        }
      ];
      
      setPositions(fakeData); */
      
      // Uncomment this to use real API data instead
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
          <h1>Sara & Erasmus</h1>
          <h2>Interrail 2025 🚂</h2>
          {/* <button 
            onClick={handleRefresh} 
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#ae3c40',
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
          </button> */}
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
              📍 Selected Position
            </h4>
            <p><strong>City:</strong> {selectedPosition.city || 'Unknown'}</p>
            <p><strong>Country:</strong> {selectedPosition.country || 'Unknown'}</p>
            <p><strong>Time:</strong> {new Date(selectedPosition.timestamp).toLocaleString()}</p>
            {selectedPosition.notes && selectedPosition.notes.length > 0 && (
              <div>
                <p><strong>Notes:</strong></p>
                {selectedPosition.notes.map((note) => (
                  <p key={note.id} style={{ fontSize: '0.9em', marginLeft: '10px' }}>
                    • {note.text}
                  </p>
                ))}
              </div>
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
        <p>An app by Sara & Erasmus</p>
        <p>Powered by Home Assistant & TypeScript | Maps by OpenStreetMap</p>
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