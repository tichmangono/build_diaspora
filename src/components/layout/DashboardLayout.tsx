import { ReactNode } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    label: 'Build Journey',
    href: '/journey',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Cost Calculator',
    href: '/calculator',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
      </svg>
    ),
    badge: 'Premium',
  },
  {
    label: 'Professional Directory',
    href: '/directory',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    ),
  },
  {
    label: 'Compliance',
    href: '/compliance',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Community',
    href: '/community',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ 
  children, 
  title,
  breadcrumbs 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-sticky">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="font-semibold text-neutral-900 hidden sm:block">
                BuildDiaspora Zimbabwe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/journey" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Journey
              </Link>
              <Link href="/calculator" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Calculator
              </Link>
              <Link href="/directory" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Directory
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Login
              </Button>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-neutral-100 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 hover:text-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <span className="group-hover:text-primary-500 transition-colors">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="badge badge-premium text-xs ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Upgrade Prompt */}
            <div className="mt-8 p-4 bg-accent-50 rounded-lg border border-accent-200">
              <h4 className="font-semibold text-neutral-900 mb-2">
                Unlock Premium Features
              </h4>
              <p className="text-body-small text-neutral-600 mb-3">
                Get detailed cost breakdowns, expert consultations, and priority support.
              </p>
              <Button variant="accent" size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className="flex items-center gap-2 text-body-small text-neutral-600 mb-6" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-primary-500 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-neutral-900 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Page Title */}
          {title && (
            <div className="mb-8">
              <h1 className="text-heading-1 text-neutral-900">{title}</h1>
            </div>
          )}

          {/* Page Content */}
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-fixed">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-3 rounded-lg text-neutral-600 hover:text-primary-500 hover:bg-primary-50 transition-all"
            >
              <span className="text-xs">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 