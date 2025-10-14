"use client";

import { useState } from 'react';

export default function SimplePage() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => {
            console.log('Input changed:', e.target.value);
            setInputValue(e.target.value);
          }}
          placeholder="Type something here..."
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '300px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Current value: {inputValue}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => {
            console.log('Button clicked!');
            setInputValue('Button clicked!');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Set Value to "Button clicked!"
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Type in the input field - should update the text below</li>
          <li>Click the button - should change the input value</li>
          <li>Check browser console for logs</li>
        </ol>
      </div>
    </div>
  );
}
