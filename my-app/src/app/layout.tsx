import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cinema E-Booking',
  description: 'Book movie tickets online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Cinema E-Booking System</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <MovieProvider>
            {children}
          </MovieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}