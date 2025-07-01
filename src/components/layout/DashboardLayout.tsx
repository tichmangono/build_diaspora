'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@/lib/hooks'
import Button from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

interface NavigationItem {
  label: string
  href: string
  icon: ReactNode
  badge?: string
  requireAuth?: boolean
  requireVerification?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    requireAuth: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    label: 'Build Journey',
    href: '/journey',
    requireAuth: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Cost Calculator',
    href: '/calculator',
    requireAuth: true,
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
    requireAuth: true,
    requireVerification: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Community',
    href: '/community',
    requireAuth: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
      </svg>
    ),
  },
]

// User Menu Component
function UserMenu() {
  const { user, logout } = useAuth()
  const { profile } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={getUserDisplayName()}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {getInitials(getUserDisplayName())}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-neutral-900 truncate max-w-32">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-neutral-600 truncate max-w-32">
            {profile?.profession || 'Professional'}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-neutral-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={getUserDisplayName()}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {getInitials(getUserDisplayName())}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-sm text-neutral-600 truncate">
                    {user?.email}
                  </p>
                  {profile?.is_verified && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Professional
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href={`/profile/${user?.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-neutral-900">View Profile</span>
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-sm text-neutral-900">Edit Profile</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-neutral-900">Settings</span>
              </Link>

              {!profile?.is_verified && (
                <Link
                  href="/verification"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-amber-700">Get Verified</span>
                </Link>
              )}

              <div className="border-t border-neutral-100 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Guest User Menu Component
function GuestUserMenu() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/login">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          Login
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="primary" size="sm">
          Get Started
        </Button>
      </Link>
    </div>
  )
}

export default function DashboardLayout({ 
  children, 
  title,
  breadcrumbs 
}: DashboardLayoutProps) {
  const { user, loading, initialized } = useAuth()
  const { profile } = useUser()

  // Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Filter navigation items based on auth status and verification
  const visibleNavItems = navigationItems.filter(item => {
    if (item.requireAuth && !user) return false
    if (item.requireVerification && (!profile?.is_verified)) return false
    return true
  })

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
            {user ? <UserMenu /> : <GuestUserMenu />}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-neutral-100 min-h-screen">
          <div className="p-6">
            {/* User Profile Section */}
            {user && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile?.full_name || 'User'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {profile?.full_name
                          ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {profile?.full_name || 'Welcome!'}
                    </p>
                    <p className="text-sm text-primary-600 truncate">
                      {profile?.profession || 'Professional'}
                    </p>
                  </div>
                </div>
                
                {!profile?.is_verified && (
                  <Link href="/verification">
                    <Button variant="accent" size="sm" className="w-full text-xs">
                      Get Verified
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <nav className="space-y-2">
              {visibleNavItems.map((item) => (
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
            {user && !profile?.is_premium && (
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
            )}
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
          {visibleNavItems.slice(0, 4).map((item) => (
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
  )
} 