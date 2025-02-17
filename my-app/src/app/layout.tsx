
import NavBar from './components/NavBar'; 

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
        <NavBar />
        {children}
      </body>
    </html>
  );
}