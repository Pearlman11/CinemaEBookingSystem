'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';


export default function NavBar() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0, padding: 0}}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/movies/now-playing">Now Playing</Link>
        </li>
        <li>
          <Link href="/movies/coming-soon">Coming Soon</Link>
        </li>
        <li>
          {isLoggedIn ? (
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Log Out
            </button>
          ) : (
            <Link href="/signin">Log In</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}