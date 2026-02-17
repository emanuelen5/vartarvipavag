import React, { useEffect, useState } from 'react';
import InterrailMap from './components/InterrailMap';
import LoginForm from './components/LoginForm';
import TravelStats from './components/TravelStats';
import { fakeInterrailData } from './data/fakeData';
import { PositionService, deterministicRandomizePosition } from './services/api';
import { Position } from './types';
import ForkMeOnGithub from './components/ForkMeOnGithub';

const App: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Check authentication status on app load
  useEffect(() => {
    // If using fake data, skip authentication
    if (import.meta.env.VITE_USE_FAKE_DATA === 'true') {
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }

    // Check if user has stored API key
    const isAuth = PositionService.isAuthenticated();
    const isAdmin = PositionService.isAdminAuthenticated();
    setIsAuthenticated(isAuth);
    setIsAdminMode(isAdmin);
    setAuthChecked(true);
  }, []);

  // Fetch positions from API
  const fetchPositions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Use fake data if VITE_USE_FAKE_DATA is 'true', otherwise use API
      let data: Position[] = [];
      if (import.meta.env.VITE_USE_FAKE_DATA === 'true') {
        console.log('Using fake data');
        data = fakeInterrailData;
      } else {
        console.log('Using API');
        data = await PositionService.getAllPositions();
      }

      setPositions(deterministicRandomizePosition(data));

    } catch (err) {
      console.error('Error fetching positions:', err);

      // If unauthorized, redirect to login
      if (err instanceof Error && err.message.includes('401')) {
        setIsAuthenticated(false);
        setError('Authentication expired. Please log in again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load after authentication
  useEffect(() => {
    if (isAuthenticated && authChecked) {
      fetchPositions();
    }
  }, [isAuthenticated, authChecked]);

  // Refresh positions every 10 minutes when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchPositions, 10 * 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLoginSuccess = (isAdmin: boolean) => {
    setIsAuthenticated(true);
    setIsAdminMode(isAdmin);
    setError(null);
    
    // Clean up URL parameters/hash after successful login
    if (window.location.search.includes('admin=true') || window.location.hash === '#admin') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  };

  const handleLogout = () => {
    PositionService.logout();
    setIsAuthenticated(false);
    setIsAdminMode(false);
  };

  const handleRefresh = (): void => {
    fetchPositions();
  };

  if (!authChecked) {
    return (
      <div className="app">
        <div className="loading">
          <h3>🔄 Loading...</h3>
          <p>Checking authentication</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Check for admin mode in URL parameter or hash
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminUrl = urlParams.get('admin') === 'true' || window.location.hash === '#admin';
    
    return (
      <div className="app">
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          showAdminOption={isAdminUrl}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Sara & Erasmus</h1>
          <h2>Honeymoon 🏝️</h2>
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
        {import.meta.env.DEV && (
          <button onClick={handleLogout}>Logga ut</button>
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
            {isAdminMode && (
              <div style={{ 
                background: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🔧</span>
                <strong>Admin-läge aktivt</strong> - Du kan ta bort positioner
              </div>
            )}
            <InterrailMap 
              positions={positions}
              isAdminMode={isAdminMode}
              onPositionDeleted={fetchPositions}
            />
            <TravelStats positions={positions} />
          </>
        )}
      </main>

      <footer>
        <div className="footer-content">
          <p>En app av Sara & Erasmus</p>
          <p>Drivs av Home Assistant & TypeScript | Kartor av OpenStreetMap</p>
        </div>
        {import.meta.env.VITE_REPO_URL && 
          <ForkMeOnGithub href={import.meta.env.VITE_REPO_URL} />
        }
      </footer>
    </div>
  );
};

export default App; 
