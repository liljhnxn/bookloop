import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BookLoop | Share a Book. Spread Knowledge.",
  description:
    "A decentralized book-sharing platform on Botchain Testnet. List books to give away and claim books from fellow readers.",
  keywords: ["BookLoop", "Web3 Books", "Botchain", "Book Sharing", "Decentralized Library"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-burntorange-light selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

