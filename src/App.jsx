import React from 'react'
import { useState } from 'react';
import './App.css';
import Chatbot from './component/Chatbot';

function App() {
 const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="home-container">
      <div className="home-box">
              <h2 className='heading-text'>MedGPT</h2>      

        <div className="tab-header">
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            🤖 Ask Doubts
          </button>
          <button
            className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            📚 Smart Notes Uploader
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'chat' ? (
            <div>
              <h2>Chatbot</h2>
              <p>Ask any medical or subject-related doubts here.</p>
              <Chatbot />
            </div>
          ) : (
            <div>
              <h2>Smart Notes Uploader</h2>
              <p>Upload your PDFs, lecture notes, or slides here.</p>
              {/* Insert File Upload Logic */}
              <input type="file" multiple />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
