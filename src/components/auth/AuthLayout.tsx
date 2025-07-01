import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BD</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">BuildDiaspora</h1>
                <p className="text-sm text-gray-600">Zimbabwe</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <Link
              href="/help"
              className="hover:text-primary-600 focus:outline-none focus:underline"
            >
              Help
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary-600 focus:outline-none focus:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary-600 focus:outline-none focus:underline"
            >
              Terms
            </Link>
          </div>
          
          <p className="text-xs text-gray-500">
            © 2024 BuildDiaspora Zimbabwe. All rights reserved.
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary-100 opacity-20 blur-3xl"></div>
      </div>
    </div>
  )
} 