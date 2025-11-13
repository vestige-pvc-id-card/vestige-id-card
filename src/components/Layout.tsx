import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Apply Now', href: '/apply' },
    { name: 'About Us', href: '/about' },
    { name: 'Policies', href: '/policies' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Image
                src="https://static.wixstatic.com/media/1878e6_8599554ce510497391660ead71601ec3~mv2.png"
                alt="Vestige Logo"
                width={120}
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-paragraph transition-colors ${
                    isActive(item.href)
                      ? 'text-primary font-medium'
                      : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">Admin</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/store">Store</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link to="/apply">Apply Now</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-foreground hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-paragraph transition-colors ${
                      isActive(item.href)
                        ? 'text-primary font-medium'
                        : 'text-foreground/70 hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/store" onClick={() => setIsMenuOpen(false)}>Store Dashboard</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full bg-primary text-primary-foreground">
                    <Link to="/apply" onClick={() => setIsMenuOpen(false)}>Apply Now</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <Image
                src="https://static.wixstatic.com/media/1878e6_6e99d90c8bf84c5091a40b577c790e5c~mv2.png"
                width={150}
                className="mb-4 brightness-0 invert opacity-[1]"
                originWidth={256}
                originHeight={256} />
              <p className="font-paragraph text-white/80 mb-4 max-w-md">
                Professional PVC ID card services with secure processing and nationwide delivery through our authorized store network.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-secondary" />
                  <span className="font-paragraph text-white/80">vestigepvcidcard@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <span className="font-paragraph text-white/80">+91 79955 03807</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-heading text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="font-paragraph text-white/80 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h3 className="font-heading text-lg mb-4">Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/policies/terms" className="font-paragraph text-white/80 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/policies/privacy" className="font-paragraph text-white/80 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/policies/shipping" className="font-paragraph text-white/80 hover:text-white transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/policies/refund" className="font-paragraph text-white/80 hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="font-paragraph text-white/60">{"© 2025 Vestige PVC ID Card Service. All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}