import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>OpenClaw Desktop</h1>
      <p>Welcome to OpenClaw Desktop</p>
      <button onClick={() => setCount(c => c + 1)}>
        Counter: {count}
      </button>
    </div>
  );
}

export default App;
