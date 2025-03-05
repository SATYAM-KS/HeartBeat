import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Menu, X } from 'lucide-react';

const HomeNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm">
      <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              aria-label="HeartBeat"
              title="HeartBeat"
              className="inline-flex items-center mr-8"
            >
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold tracking-wide text-gray-800">
                HeartBeat
              </span>
            </Link>
            <ul className="hidden items-center space-x-8 lg:flex">
              <li>
                <a
                  href="#features"
                  aria-label="Features"
                  title="Features"
                  className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  aria-label="Testimonials"
                  title="Testimonials"
                  className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  aria-label="About us"
                  title="About us"
                  className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                >
                  About us
                </a>
              </li>
            </ul>
          </div>
          <ul className="hidden items-center space-x-8 lg:flex">
            <li>
              <Link
                to="/login"
                aria-label="Sign in"
                title="Sign in"
                className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-red-600 hover:bg-red-700 focus:shadow-outline focus:outline-none"
                aria-label="Sign up"
                title="Sign up"
              >
                Sign up
              </Link>
            </li>
          </ul>
          <div className="lg:hidden">
            <button
              aria-label="Open Menu"
              title="Open Menu"
              className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-red-50"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 text-gray-600" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-0 left-0 w-full z-10">
                <div className="p-5 bg-white border rounded shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Link
                        to="/"
                        aria-label="HeartBeat"
                        title="HeartBeat"
                        className="inline-flex items-center"
                      >
                        <Droplet className="h-8 w-8 text-red-600" />
                        <span className="ml-2 text-xl font-bold tracking-wide text-gray-800">
                          HeartBeat
                        </span>
                      </Link>
                    </div>
                    <div>
                      <button
                        aria-label="Close Menu"
                        title="Close Menu"
                        className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <X className="w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <nav>
                    <ul className="space-y-4">
                      <li>
                        <a
                          href="#features"
                          aria-label="Features"
                          title="Features"
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Features
                        </a>
                      </li>
                      <li>
                        <a
                          href="#testimonials"
                          aria-label="Testimonials"
                          title="Testimonials"
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Testimonials
                        </a>
                      </li>
                      <li>
                        <a
                          href="#about"
                          aria-label="About us"
                          title="About us"
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          About us
                        </a>
                      </li>
                      <li>
                        <Link
                          to="/login"
                          aria-label="Sign in"
                          title="Sign in"
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign in
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/register"
                          className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-red-600 hover:bg-red-700 focus:shadow-outline focus:outline-none"
                          aria-label="Sign up"
                          title="Sign up"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeNavbar;