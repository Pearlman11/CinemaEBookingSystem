import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { UserProvider } from './context/UserContext';

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
      
      <body className={inter.className}>
        <AuthProvider>
          <MovieProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </MovieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}