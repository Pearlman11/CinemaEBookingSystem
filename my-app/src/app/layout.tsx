import NavBar from './components/NavBar/NavBar';
import './globals.css'
import { AuthProvider } from './context/AuthContext';


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
 
      <body>
        <AuthProvider>
        <NavBar/>
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}