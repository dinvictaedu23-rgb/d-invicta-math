export const metadata = {
  title: "D-INVICTA Math",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
