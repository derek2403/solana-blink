import { useState } from 'react';

export default function ChatBox({ walletAddress }) {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/extract-payload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput, walletAddress }), // Pass user input and wallet address
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();
            setResponse(result.message); // Success message from the backend
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
        </div>
    );
}
