"use client";

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JavaScript Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => alert('Button works!')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Alert Button
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
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
        <button 
          onClick={() => {
            const input = document.querySelector('input') as HTMLInputElement;
            if (input) {
              alert('Input value: ' + input.value);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Get Input Value
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click the blue button - should show alert</li>
          <li>Type something in the input field</li>
          <li>Click the green button - should show input value</li>
        </ol>
        <p>If none of these work, there's a JavaScript issue.</p>
      </div>
    </div>
  );
}
