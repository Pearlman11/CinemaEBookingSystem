import NavBar from './components/NavBar';
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
        <NavBar></NavBar>
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}