import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function DashboardLayout({ children, sidebar }: { children: React.ReactNode; sidebar?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {sidebar ? (
          <div className="flex gap-8">
            <aside className="w-64 flex-shrink-0 hidden lg:block">{sidebar}</aside>
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        ) : (
          children
        )}
      </div>
      <Footer />
    </div>
  );
}
