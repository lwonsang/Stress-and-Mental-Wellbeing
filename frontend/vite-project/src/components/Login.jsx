import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Title, MantineProvider} from '@mantine/core';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const getAccounts = () => JSON.parse(localStorage.getItem('accounts')) || [];
  const saveAccounts = (accounts) => localStorage.setItem('accounts', JSON.stringify(accounts));

  const handleLogin = () => {
    if (!username || !password) {
      setMessage("Username and password cannot be empty");
      return;
    }
    const accounts = getAccounts();
    const found = accounts.find(acc => acc.username === username && acc.password === password);
    if (found) {
      const user = { username };
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUser(user); 
      navigate("/");
    } else {
      setMessage('Invalid username or password');
    }
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    const accounts = getAccounts();
    if (accounts.some(acc => acc.username === username)) {
      setMessage('Username already exists');
      return;
    }
    accounts.push({ username, password });
    saveAccounts(accounts);
    setMessage('Registration successful! You can now log in.');
    setMode('login');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '40px' // spacing between intro and login box
      }}
    >
      <MantineProvider>
        <div style={{ maxWidth: '320px', textAlign: 'left' }}>
          <Title order={2}>
            <strong>Well-being Task Management Website:</strong> Add your tasks here and arrange them in a single click!
          </Title>
        </div>
      </MantineProvider>
      <div style={{
        maxWidth: 300,
        width: '100%',
        border: '2px solid black',
        borderRadius: 10,
        padding: 20,
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h2>{mode === 'login' ? 'Log In' : 'Register'}</h2>
        <div style={{ marginBottom: 10 }}>
          <label>Username<br/>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 5 }} />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password<br/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 5 }} />
          </label>
        </div>
        {mode === 'register' && (
          <div style={{ marginBottom: 10 }}>
            <label>Confirm Password<br/>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 5 }} />
            </label>
          </div>
        )}
        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          style={{ backgroundColor: '#35B200', color: 'white', padding: '6px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {mode === 'login' ? 'Log in' : 'Register'}
        </button>
        <div style={{ marginTop: 10, fontSize: 14 }}>
          {mode === 'login' ? (
            <>Don't have an account? <span onClick={() => setMode('register')} style={{ color: 'blue', cursor: 'pointer' }}>Register here!</span></>
          ) : (
            <>Already have an account? <span onClick={() => setMode('login')} style={{ color: 'blue', cursor: 'pointer' }}>Login here!</span></>
          )}
        </div>
        {message && <div style={{ marginTop: 10, color: 'red' }}>{message}</div>}
      </div>
    </div>
  );
}
