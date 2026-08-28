import "./globals.css";

export const metadata = {
  title: "D-INVICTA Math",
  description: "Mathematics Learning System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
