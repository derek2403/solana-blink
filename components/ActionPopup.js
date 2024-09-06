import { useEffect, useState } from 'react';
import { Blink } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";

export default function ActionPopup({ actionApiUrl, onClose }) {
  const { adapter } = useActionSolanaWalletAdapter('https://api.devnet.solana.com');
  const [action, setAction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAction() {
      try {
        const response = await fetch(actionApiUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        
        const data = await response.json();

        console.log('Fetched action data:', JSON.stringify(data, null, 2));

        // Process the action data to match Blink's expected structure
        const processedAction = {
          id: data.id || actionApiUrl, // Use the API URL as a fallback ID
          title: data.title || '',
          description: data.description || '',
          icon: data.icon || '',
          label: data.label || '',
          links: {
            url: actionApiUrl, // Use the API URL as the action URL
            actions: data.links?.actions || []
          },
          metadata: {
            // Add any additional metadata fields required by Blink
          }
        };

        setAction(processedAction);
      } catch (error) {
        setError(error.message || 'Error fetching action');
        console.error('Error fetching action:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAction();
  }, [actionApiUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const renderBlink = () => {
    if (!action) return null;

    try {
      return (
        <Blink
          action={action}
          websiteText={new URL(actionApiUrl).hostname}
          stylePreset="x-light"
        />
      );
    } catch (error) {
      console.error('Error rendering Blink:', error);
      return <p>Error rendering Blink component: {error.message}</p>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '20px',
      background: '#fff',
      border: '1px solid #ddd',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      width: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
    }}>
      <h3>Action Preview</h3>
      
      {isLoading && <p>Loading Blink preview...</p>}
      {error && <p>Error: {error}</p>}
      
      {action && !isLoading && !error && (
        <div style={{ width: '100%', height: '200px' }}>
          {renderBlink()}
        </div>
      )}

      {action && (
        <div style={{ marginTop: '20px' }}>
          <h4>Debug Information:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(action, null, 2)}
          </pre>
        </div>
      )}

      <br />
      <button onClick={onClose}>Close</button>
    </div>
  );
}