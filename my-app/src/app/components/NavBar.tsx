'use client'
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav>
      <Link href="/">Home</Link> |{' '}
      <Link href="/movies/now-playing">Now Playing</Link> |{' '}
      <Link href="/movies/coming-soon">Coming Soon</Link> |{' '}
      <Link href="/signin">Sign In</Link> |{' '}
      <Link href = "/booking">Book Moive</Link>
    </nav>
  );
}