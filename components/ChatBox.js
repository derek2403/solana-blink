import { useState } from 'react';
import ActionPopup from './ActionPopup'; // Import the ActionPopup component

export default function ChatBox({ walletAddress }) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [actionApiUrl, setActionApiUrl] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userInput.trim()) {
      setResponse('Prompt cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/extract-payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput, walletAddress }), // Ensure this matches the expected format
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setResponse(result.message);

      // Assuming the backend returns the action URL
      const newActionApiUrl = `http://localhost:3000/api/actions/${walletAddress}/buyNFT`;
      console.log('Generated Action URL:', newActionApiUrl); // Log for debugging
      setActionApiUrl(newActionApiUrl);
      setShowPopup(true);

    } catch (error) {
      console.error('Error submitting prompt:', error);
      setResponse('Failed to submit prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe your NFT..."
          rows="4"
          cols="50"
        />
        <button type="submit" disabled={loading || !walletAddress}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {response && <p>{response}</p>}
      {actionApiUrl && (
        <p>
          Action Link: <a href={actionApiUrl} target="_blank" rel="noopener noreferrer">{actionApiUrl}</a>
        </p>
      )}
    </div>
  );
}
