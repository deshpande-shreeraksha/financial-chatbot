'use client';
import React, { useState, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/cohere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          history: chatHistory.slice(-10) // trim to last 10 messages
        })
      });

      const data = await response.json();
      const botMessage: Message = { role: 'assistant', content: data.reply };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error fetching response. Please try again.' }
      ]);
    }

    setInput('');
    setLoading(false);
  };

  const sendFeedback = async (rating: 'positive' | 'negative') => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, timestamp: Date.now() })
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-4 rounded">
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        onBlur={() => localStorage.setItem('userName', userName)}
        className="border p-2 rounded mb-4 w-full"
      />

      <h2 className="text-xl font-semibold mb-4">
        Hi {userName}, ready to explore today’s financial tips?
      </h2>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`p-3 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
            <p><strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}</p>
            {msg.role === 'assistant' && (
              <div className="flex gap-2 mt-2 justify-start">
                <button
                  onClick={() => sendFeedback('positive')}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  👍 Helpful
                </button>
                <button
                  onClick={() => sendFeedback('negative')}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  👎 Not Helpful
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border p-2 rounded-l"
          placeholder="Ask about loans, scams, banking..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">
          Send
        </button>
      </form>
    </div>
  );
}
