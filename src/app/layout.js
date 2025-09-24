import './globals.css'

export const metadata = {
  title: 'Matrix Retail Management',
  description: 'Smart retail management system with QR code scanning and real-time analytics',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}