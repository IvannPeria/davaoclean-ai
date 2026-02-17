import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                DavaoClean AI
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-white hover:text-gray-900">About</Link>
              <Link href="/classifier" className="text-white hover:text-gray-900">Classifier</Link>
            </div>
            <Link href="/classifier" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
              Start
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <section className="pt-32 pb-20 px-4 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <img src="/img/main.jpg" alt="DavaoClean AI" className="w-full h-full bg-no-repeat mb-10" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Waste Segregation
            <br />
            <span className="text-gray-600">for Davao City</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            DavaoClean AI revolutionizes waste management in Davao City with AI-powered solutions. 
            Upload a waste photo, receive instant classification, and view collection schedules.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/classifier" className="bg-black text-white px-8 py-3 rounded-md text-lg hover:bg-gray-800">
              Classify Now
            </Link>
            <Link href="/about" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md text-lg hover:bg-gray-50">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to properly segregate your waste</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-12 mb-6 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Photo</h3>
              <p className="text-gray-600">Take or upload a photo of your waste item</p>
              <button className="mt-4 text-sm text-gray-500 hover:text-gray-700">Next →</button>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-12 mb-6 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Classification</h3>
              <p className="text-gray-600">Our AI analyzes and categorizes your waste</p>
              <button className="mt-4 text-sm text-gray-500 hover:text-gray-700">Next →</button>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-12 mb-6 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. View Schedule</h3>
              <p className="text-gray-600">Get disposal instructions and collection schedule</p>
              <button className="mt-4 text-sm text-gray-500 hover:text-gray-700">Next →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Tons Daily Waste</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">85%</div>
              <div className="text-gray-600">Landfill Capacity</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">40%</div>
              <div className="text-gray-600">Diversion Rate Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits</h2>
            <p className="text-gray-600">Why choose DavaoClean AI</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
              <p className="text-gray-600">Reduce landfill waste and promote sustainable practices in Davao City</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Made Easy</h3>
              <p className="text-gray-600">Automatically follow local waste segregation regulations</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cleaner Neighborhoods</h3>
              <p className="text-gray-600">Contribute to cleaner, healthier communities across the city</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
              <p className="text-gray-600">Powered by advanced AI for accurate waste classification</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant feedback and collection schedule information</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">SDG Alignment</h3>
              <p className="text-gray-600">Supporting UN SDG 11 (Sustainable Cities) and SDG 12 (Responsible Consumption)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start classifying your waste today and contribute to a cleaner Davao City
          </p>
          <Link href="/classifier" className="inline-block bg-black text-white px-8 py-3 rounded-md text-lg hover:bg-gray-800">
            Try the Classifier
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about DavaoClean AI</p>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "How accurate is the AI waste classifier?",
                a: "Our AI classifier has been trained on thousands of waste images and achieves over 95% accuracy in categorizing waste into Biodegradable, Recyclable, Residual, and Special Waste categories."
              },
              {
                q: "What types of waste can the system identify?",
                a: "The system can identify all major waste categories: Biodegradable (food waste, garden waste), Recyclable (plastics, paper, metal, glass), Residual (non-recyclable items), and Special Waste (electronics, batteries, hazardous materials)."
              },
              {
                q: "Is my data and photos kept private?",
                a: "Yes, we prioritize your privacy. Photos are processed securely and are not stored permanently. We only retain anonymous classification data to improve our AI model."
              },
              {
                q: "How do I use the waste classifier?",
                a: "Simply take a clear photo of your waste item or upload an existing image. Our AI will analyze it within seconds and provide the waste category along with proper disposal instructions."
              },
              {
                q: "What are the collection schedules?",
                a: "Collection schedules vary by barangay in Davao City. After classification, you'll receive specific schedule information based on your location and waste type."
              },
              {
                q: "Can I use this service for free?",
                a: "Yes! DavaoClean AI is completely free to use for all residents and businesses in Davao City as part of our commitment to sustainable waste management."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-gray-600">Reach out to our team for technical support or partnership opportunities</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-gray-600 mb-2">Send us a message</p>
              <a href="mailto:support@davaoclean.ai" className="text-blue-600 hover:underline">support@davaoclean.ai</a>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Phone</h3>
              <p className="text-sm text-gray-600 mb-2">Call during business hours</p>
              <a href="tel:+6382123456" className="text-blue-600 hover:underline">+63 (82) 123-4567</a>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Office</h3>
              <p className="text-sm text-gray-600 mb-2">Davao City, Mindanao, Philippines</p>
              <a href="#" className="text-blue-600 hover:underline">Get directions →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DavaoClean AI</h3>
              <p className="text-gray-400">Smart waste management for a sustainable Davao City</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/classifier" className="text-gray-400 hover:text-white">Classifier</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Learn</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Community</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DavaoClean AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}