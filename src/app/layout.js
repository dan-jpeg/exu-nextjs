import "./globals.css";

export const metadata = {
  title: "Edie Xu",
  description: "Artist portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="scroll-root">{children}</div>
      </body>
    </html>
  );
}
