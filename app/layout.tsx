import Header from '../components/misc/header';
import '../styles/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="jp">
      <body>
        <div className="flex flex-col min-h-screen overflow-hidden tracking-wide">
          <Header />
          <main className="grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
