'use client';
import { useState } from 'react';

export default function ChatWindow() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Guest' : 'Guest';
const greeting = `Hi ${userName}, ready to explore today’s financial tips?`;

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

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const botReply = await getChatResponse(input);
      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error fetching response. Please try again later.' }]);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-4 rounded">
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
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
