'use client';
import React, { useState, useEffect } from 'react';

type Message = {
    role: 'user' | 'assistant';
    content: string;
  };
  

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const userMessage: Message = { role: 'user', content: input };

  const trimmedHistory = [...chatHistory, userMessage].slice(-10);

  useEffect(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) container.scrollTop = container.scrollHeight;
  }, [chatHistory]);
  

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);
 


  const getChatResponse = async (userPrompt: string): Promise<string> => {
    const response = await fetch('/api/cohere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unknown error');
    return data.reply;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    // ✅ Step 1: Add user message to history
    const userMessage: Message = { role: 'user', content: input };
    setChatHistory((prev) => [...prev, userMessage]);
  
    setLoading(true);
  
    try {
      // ✅ Step 2: Call backend with trimmed history
      const response = await fetch('/api/cohere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          history: [...chatHistory, userMessage].slice(-10) // include latest user message
        })
      });
  
      const data = await response.json();
  
      // ✅ Step 3: Add bot reply to history
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
  
  const getLoanEstimate = async (amount: number, rate: number, years: number): Promise<string> => {
    const response = await fetch('/api/loan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, rate, years })
    });
    try {
        const result = await getLoanEstimate(500000, 8, 5);
        setChatHistory((prev) => [...prev, { role: 'assistant', content: result }]);
      } catch (error) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: '⚠️ Unable to fetch data. Please try again.' }]);
      }
      
  
    const data = await response.json();
    return `Your estimated EMI is ₹${data.emi} per month.`;
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
      {/* Greeting */}
      <h2 className="text-xl font-semibold mb-4">
        Hi {userName}, ready to explore today’s financial tips?
      </h2>
  
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'
            }`}
          >
            <p>
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </p>
          </div>
        ))}
      </div>
  
      {/* Input Form */}
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
  