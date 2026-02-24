import Link from 'next/link';

/**
 * Footer Component
 * Shared footer used across all pages.
 * Contains quick links, resources, legal info, and branding.
 */
export default function Footer() {
  return (
    <footer className="bg-green-950 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌿</span>
              <h3 className="text-xl font-bold">DavaoClean AI</h3>
            </div>
            <p className="text-green-300 text-sm leading-relaxed">
              Smart waste management for a sustainable Davao City. Powered by AI, driven by community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-green-200">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/classifier', label: 'Classifier' },
                { href: '/volunteer', label: 'Volunteer' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-green-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-green-200">Resources</h4>
            <ul className="space-y-2">
              {['Learn', 'Community', 'Support'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-green-400 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-green-200">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-green-400 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 pt-8 text-center text-green-500 text-sm">
          <p>&copy; {new Date().getFullYear()} DavaoClean AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}