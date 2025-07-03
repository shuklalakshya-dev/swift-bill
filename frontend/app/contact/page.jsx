
import Spline from '@splinetool/react-spline/next';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Mobile first design - stack vertically on small screens, horizontal on larger screens */}
      <div className="flex flex-col min-h-screen lg:grid lg:grid-cols-6">
        {/* Spline container - full width on mobile, col-span-4 on lg screens */}
        <div className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-screen lg:col-span-4 relative">
          {/* Fallback gradient background in case Spline fails to load */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
          
          <div className="absolute inset-0">
            <Spline
              scene="https://prod.spline.design/CfVKYCGgHIpSccCR/scene.splinecode" 
            />
          </div>
          
          {/* Brand overlay (visible on larger screens) */}
          <div className="hidden md:block absolute bottom-6 left-6 z-10">
            <h2 className="text-white text-xl font-bold">SwiftBill</h2>
            <p className="text-white/70 text-sm">Innovative billing solutions</p>
          </div>
        </div>
        {/* Contact form container - full width on mobile, col-span-2 on lg screens */}
        <div className="p-4 sm:p-6 md:p-8 lg:col-span-2 flex flex-col">
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 text-center">Contact Us</h1>
            
            {/* Contact form */}
            <form className="w-full mb-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-600 rounded bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-600 rounded bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Your Message"
                className="w-full p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-600 rounded bg-gray-800/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 sm:h-32"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
            
            {/* Social links */}
            <div className="flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-10">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/_shuklalakshya?igsh=eXd2N2tudDJjaGp0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-100 transition duration-200 hover:text-pink-400 active:text-pink-500 transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/lakshyashukla123/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-100 transition duration-200 hover:text-blue-600 active:text-blue-700 transform hover:scale-110"
              
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* GitHub */}
              <a 
                href="https://github.com/shuklalakshya-dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-100 transition duration-200 hover:text-gray-400 active:text-gray-500 transform hover:scale-110"
                aria-label="GitHub"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
            
            {/* Contact info */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                Email us: <a href="mailto:contact@swiftbill.com" className="text-blue-400 hover:text-blue-300">contact@swiftbill.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
