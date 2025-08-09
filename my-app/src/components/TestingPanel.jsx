import React, { useState, useEffect } from 'react';

const TestingPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Capture console logs for mobile debugging
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      if (isMobile) {
        setLogs(prev => [...prev.slice(-49), {
          type: 'log',
          message: args.join(' '),
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      if (isMobile) {
        setLogs(prev => [...prev.slice(-49), {
          type: 'error',
          message: args.join(' '),
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (isMobile) {
        setLogs(prev => [...prev.slice(-49), {
          type: 'warn',
          message: args.join(' '),
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      originalWarn.apply(console, args);
    };

    return () => {
      window.removeEventListener('resize', checkMobile);
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isMobile]);

  const clearLogs = () => {
    setLogs([]);
  };

  const testFunctions = [
    { name: 'Test Navigation', action: () => console.log('Navigation test completed') },
    { name: 'Test API', action: () => console.log('API test completed') },
    { name: 'Test Auth', action: () => console.log('Auth test completed') },
    { name: 'Test Components', action: () => console.log('Components test completed') }
  ];

  return (
    <>
      {/* Toggle Button */}
      <button 
        className="testing-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className="material-icons-round">
          {isOpen ? 'close' : 'bug_report'}
        </span>
      </button>

      {/* Testing Panel */}
      {isOpen && (
        <div 
          className="testing-panel"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: isMobile ? 'calc(100vw - 40px)' : '400px',
            maxHeight: '500px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 9998,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Testing Panel</h3>
          </div>

          {/* Test Buttons */}
          <div className="test-functions" style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px' 
            }}>
              {testFunctions.map((func, index) => (
                <button
                  key={index}
                  onClick={func.action}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {func.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Console Logs */}
          {isMobile && (
            <div className="mobile-console" style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Console Logs</h4>
                <button
                  onClick={clearLogs}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Clear
                </button>
              </div>
              
              <div 
                className="logs-container"
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  padding: '8px',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
              >
                {logs.length === 0 ? (
                  <p style={{ margin: 0, color: '#888' }}>No logs yet...</p>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index}
                      style={{
                        marginBottom: '4px',
                        color: log.type === 'error' ? '#ff6b6b' : 
                               log.type === 'warn' ? '#ffd43b' : '#51cf66'
                      }}
                    >
                      <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TestingPanel;