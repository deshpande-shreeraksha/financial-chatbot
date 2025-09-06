'use client';
import React, { useState, useEffect } from 'react';
import { Message } from '../lib/types';


export default async function ChatWindow() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userName, setUserName] = useState('Guest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const savedHistory = localStorage.getItem('chatHistory');
    if (storedName) setUserName(storedName);
    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) container.scrollTop = container.scrollHeight;
  }, [chatHistory]);
  const response = await fetch('/api/finbot', {
    method: 'POST',
    body: JSON.stringify({ prompt: input })
  });
  
  const parseLoanQuery = (text: string) => {
    const match = text.match(/₹?(\d+)[^\d]*(\d+)%[^\d]*(\d+)/);
    if (!match) return null;
    return {
      amount: parseInt(match[1]),
      rate: parseFloat(match[2]),
      years: parseInt(match[3])
    };
  };

  const getLoanEstimate = async (amount: number, rate: number, years: number): Promise<string> => {
    const response = await fetch('/api/loan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, rate, years })
    });
    const data = await response.json();
    return `Your estimated EMI is ₹${data.emi} per month.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    const parsed = parseLoanQuery(input);
    if (parsed) {
      const reply = await getLoanEstimate(parsed.amount, parsed.rate, parsed.years);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
      setInput('');
      setLoading(false);
      return;
    }

    const tone = localStorage.getItem('tone') || 'formal';
    const role = localStorage.getItem('role') || 'advisor';

    const response = await fetch('/api/cohere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: input,
        history: [...chatHistory, userMessage].slice(-10),
        tone,
        role
      })
    });

    const data = await response.json();
    const botMessage: Message = { role: 'assistant', content: data.reply };
    setChatHistory((prev) => [...prev, botMessage]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-4 rounded">
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        onBlur={() => localStorage.setItem('userName', userName)}
        className="border p-2 rounded mb-4 w-full"
        placeholder="Enter your name"
      />

      <select onChange={(e) => localStorage.setItem('tone', e.target.value)} className="mb-2">
        <option value="formal">Formal</option>
        <option value="casual">Casual</option>
      </select>

      <select onChange={(e) => localStorage.setItem('role', e.target.value)} className="mb-4">
        <option value="advisor">Advisor</option>
        <option value="analyst">Analyst</option>
        <option value="officer">Loan Officer</option>
      </select>

      <h2 className="text-xl font-semibold mb-4">
        Hi {userName}, ready to explore today’s financial tips?
      </h2>

      <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`p-3 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
            <p><strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}</p>
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
