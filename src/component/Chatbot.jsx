import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';  
import '../App.css';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    setInput('');
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/chat', { text: input });
      const botMessage = { role: 'bot', content: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { role: 'bot', content: 'Error: Failed to connect to the server.' };
      console.log('Error:', error);
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput('');
  };

  return (
    <div className="medgpt-app">

      <div className="medgpt-chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`medgpt-message ${msg.role}`}>
            <strong>{msg.role === 'user' ? "You" : 'MedGPT'}:</strong>
            {msg.role === 'bot' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
      </div>

      <div className="medgpt-input-area">
        <input
          type="text"
          placeholder="Ask a medical question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage }>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
