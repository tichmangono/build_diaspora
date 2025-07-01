import Link from 'next/link';
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-sticky">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="font-semibold text-neutral-900 hidden sm:block">
                BuildDiaspora Zimbabwe
              </span>
            </Link>
            
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-display-1 font-bold mb-6 animate-fade-in">
              Build Your Dream Home in{" "}
              <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-300">
                Zimbabwe
              </span>
            </h1>
            <p className="text-body-large text-primary-50 mb-8 max-w-2xl mx-auto animate-fade-in">
              Navigate your property development journey with expert guidance, 
              cost calculators, and verified professionals. From planning to completion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button variant="accent" size="lg" className="shadow-lg">
                Start Your Journey
              </Button>
              <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-display-2 font-bold text-neutral-900 mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
              Comprehensive tools and resources designed specifically for Zimbabweans 
              building from abroad or locally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Journey Tracker */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-6 pb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-heading-3 font-semibold text-neutral-900">
                    Build Journey Tracker
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="px-6 pb-6">
                  <p className="text-body text-neutral-600 mb-4">
                    Step-by-step guidance through every stage of construction, 
                    from land acquisition to final inspections.
                  </p>
                  <ProgressBar value={75} showLabel={true} label="Sample Progress" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Cost Calculator */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-6 pb-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                    </svg>
                  </div>
                  <h3 className="text-heading-3 font-semibold text-neutral-900">
                    Smart Cost Calculator
                  </h3>
                  <Badge variant="premium" className="mt-2">Premium</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="px-6 pb-6">
                  <p className="text-body text-neutral-600 mb-4">
                    Get accurate cost estimates based on current Zimbabwe market rates, 
                    plot size, and location-specific factors.
                  </p>
                  <div className="bg-accent-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-accent-600">$45,000</div>
                    <div className="text-caption text-neutral-600">Estimated build cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Professional Directory */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="p-6 pb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <h3 className="text-heading-3 font-semibold text-neutral-900">
                    Verified Professionals
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="px-6 pb-6">
                  <p className="text-body text-neutral-600 mb-4">
                    Connect with certified architects, engineers, contractors, 
                    and other building professionals across Zimbabwe.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-accent-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-success border-2 border-white"></div>
                    </div>
                    <span className="text-body-small text-neutral-600">200+ verified professionals</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary-500">500+</div>
              <div className="text-body-small text-neutral-600">Projects Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent-400">$2M+</div>
              <div className="text-body-small text-neutral-600">Cost Savings Generated</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">200+</div>
              <div className="text-body-small text-neutral-600">Verified Professionals</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-info">98%</div>
              <div className="text-body-small text-neutral-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-2 font-bold text-white mb-4">
            Ready to Start Building?
          </h2>
          <p className="text-body-large text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Zimbabweans who have successfully built their dream homes 
            with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg">
              Start Your Journey
            </Button>
            <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BD</span>
                </div>
                <span className="font-semibold text-white">BuildDiaspora Zimbabwe</span>
              </div>
              <p className="text-body-small">
                Empowering Zimbabweans to build their dream homes with confidence and clarity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-body-small">
                <li><Link href="/journey" className="hover:text-white transition-colors">Build Journey</Link></li>
                <li><Link href="/calculator" className="hover:text-white transition-colors">Cost Calculator</Link></li>
                <li><Link href="/directory" className="hover:text-white transition-colors">Professional Directory</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-body-small">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-body-small">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-body-small">
            <p>&copy; 2024 BuildDiaspora Zimbabwe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
