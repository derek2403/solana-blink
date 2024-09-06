import { useState } from 'react';
import BlinkPreview from './DynamicBlink'; // Make sure the import path is correct

export default function ChatBox({ walletAddress }) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [actionApiUrl, setActionApiUrl] = useState('');

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
        body: JSON.stringify({ prompt: userInput, walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setResponse(result.message);

      const newActionApiUrl = `http://localhost:3000/api/actions/${walletAddress}/buyNFT`;
      console.log('Generated Action URL:', newActionApiUrl);
      setActionApiUrl(newActionApiUrl);

    } catch (error) {
      console.error('Error submitting prompt:', error);
      setResponse('Failed to submit prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What Blink should I generate?"
          rows="4"
          cols="50"
          className={styles.animatedInput} // Apply the CSS class here
        />
        <button type="submit" disabled={loading || !walletAddress} className={styles.button}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {response && <p className={styles.response}>{response}</p>}
      {actionApiUrl && (
        <div>
          <p>
            Action Link: <a href={actionApiUrl} target="_blank" rel="noopener noreferrer">{actionApiUrl}</a>
          </p>
          <BlinkPreview actionApiUrl={actionApiUrl} />
        </div>
      )}
    </div>
  );
}
