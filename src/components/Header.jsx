import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Default to light mode as per specification (C-03)
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-color), #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#020617',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            B
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>BSOL / SOL Ratio</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Staking & Conversion Tracker</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="https://github.com/awhipp/bsol-sol-ratio"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ padding: '0.5rem' }}
            title="GitHub Repository"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17 0-1.5-.5-2.7-1.3-3.7.13-.3.5-1.7-.13-3.6 0 0-1-.3-3.3 1.2a11.5 11.5 0 0 0-6 0C7.3 2.5 6.3 2.8 6.3 2.8c-.6 1.9-.2 3.3-.1 3.6A5.5 5.5 0 0 0 4.9 10.1c0 5.7 3.3 6.8 6.5 7.17a4.8 4.8 0 0 0-1 3.03v4"></path>
              <path d="M9 20c-3 1-5-1-5-3"></path>
            </svg>
          </a>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: '0.5rem' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
