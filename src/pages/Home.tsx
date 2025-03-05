import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Users, AlertCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-red-50">
        <div className="absolute inset-x-0 bottom-0">
          <svg
            viewBox="0 0 224 12"
            fill="currentColor"
            className="w-full -mb-1 text-white"
            preserveAspectRatio="none"
          >
            <path d="M0,0 C48.8902582,6.27314026 86.2235915,9.40971039 112,9.40971039 C137.776408,9.40971039 175.109742,6.27314026 224,0 L224,12.0441132 L0,12.0441132 L0,0 Z" />
          </svg>
        </div>
        <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-24">
          <div className="relative max-w-2xl sm:mx-auto sm:max-w-xl md:max-w-2xl sm:text-center">
            <div className="flex justify-center mb-6">
              <Droplet className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="mb-6 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl sm:leading-none">
              Donate Blood, <br className="hidden md:block" />
              <span className="text-red-600">Save Lives</span>
            </h2>
            <p className="mb-6 text-base text-gray-700 md:text-lg">
              HeartBeat connects blood donors with those in need. Join our community and help save lives through the gift of blood donation.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-red-600 hover:bg-red-700 focus:shadow-outline focus:outline-none"
              >
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-red-600 transition duration-200 rounded shadow-md border border-red-600 hover:bg-red-50 focus:shadow-outline focus:outline-none"
              >
                Login
              </Link>
            </div>
            <p className="max-w-md mb-10 text-xs text-gray-600 sm:text-sm sm:mx-auto">
              Join thousands of donors who have already made a difference in their communities.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
            How HeartBeat Works
          </h2>
          <p className="text-base text-gray-700 md:text-lg">
            Our platform makes blood donation simple, efficient, and impactful.
          </p>
        </div>
        <div className="grid gap-8 row-gap-0 lg:grid-cols-3">
          <div className="relative text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-600">
              <Droplet className="w-8 h-8" />
            </div>
            <h6 className="mb-2 text-xl font-bold">Donate Blood</h6>
            <p className="max-w-md mb-3 text-sm text-gray-600 sm:mx-auto">
              Register as a donor, find donation centers near you, and track your donation history.
            </p>
          </div>
          <div className="relative text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h6 className="mb-2 text-xl font-bold">Request Help</h6>
            <p className="max-w-md mb-3 text-sm text-gray-600 sm:mx-auto">
              Create emergency blood requests for patients in need and connect with potential donors.
            </p>
          </div>
          <div className="relative text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-red-600">
              <Users className="w-8 h-8" />
            </div>
            <h6 className="mb-2 text-xl font-bold">Join Community</h6>
            <p className="max-w-md mb-3 text-sm text-gray-600 sm:mx-auto">
              Be part of a community dedicated to saving lives through blood donation.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20 bg-red-50">
        <div className="grid grid-cols-2 row-gap-8 md:grid-cols-4">
          <div className="text-center md:border-r">
            <h6 className="text-4xl font-bold text-red-600">5K+</h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              Donors
            </p>
          </div>
          <div className="text-center md:border-r">
            <h6 className="text-4xl font-bold text-red-600">10K+</h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              Donations
            </p>
          </div>
          <div className="text-center md:border-r">
            <h6 className="text-4xl font-bold text-red-600">2K+</h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              Lives Saved
            </p>
          </div>
          <div className="text-center">
            <h6 className="text-4xl font-bold text-red-600">100+</h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              Hospitals
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
            What Our Community Says
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3 sm:max-w-sm sm:mx-auto lg:max-w-full">
          <div className="p-8 bg-white border rounded shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wide uppercase">
              <span className="text-red-600">Regular Donor</span>
            </p>
            <div className="mb-3 text-gray-700">
              <p className="text-sm italic">
                "I've been donating blood for years, but HeartBeat has made the process so much easier. I can track my donations and see the impact I'm making."
              </p>
            </div>
            <div className="flex items-center">
              <div className="mr-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Sarah Johnson</p>
                <p className="text-sm text-gray-600">Donated 12 times</p>
              </div>
            </div>
          </div>
          <div className="p-8 bg-white border rounded shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wide uppercase">
              <span className="text-red-600">Emergency Recipient</span>
            </p>
            <div className="mb-3 text-gray-700">
              <p className="text-sm italic">
                "When my father needed emergency blood transfusions, HeartBeat helped us find donors quickly. The platform literally saved his life."
              </p>
            </div>
            <div className="flex items-center">
              <div className="mr-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Michael Chen</p>
                <p className="text-sm text-gray-600">Family of recipient</p>
              </div>
            </div>
          </div>
          <div className="p-8 bg-white border rounded shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wide uppercase">
              <span className="text-red-600">Hospital Partner</span>
            </p>
            <div className="mb-3 text-gray-700">
              <p className="text-sm italic">
                "HeartBeat has revolutionized how we manage blood supplies. The emergency request feature has been invaluable during critical shortages."
              </p>
            </div>
            <div className="flex items-center">
              <div className="mr-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Dr. Emily Rodriguez</p>
                <p className="text-sm text-gray-600">City General Hospital</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20 bg-red-600">
        <div className="max-w-xl sm:mx-auto lg:max-w-2xl">
          <div className="flex flex-col mb-16 sm:text-center sm:mb-0">
            <div className="mb-6 sm:mx-auto">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
              <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl md:mx-auto">
                Ready to Make a Difference?
              </h2>
              <p className="text-base text-red-100 md:text-lg">
                Join HeartBeat today and become part of a community dedicated to saving lives through blood donation.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-red-600 transition duration-200 rounded shadow-md bg-white hover:bg-gray-100 focus:shadow-outline focus:outline-none"
              >
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md border border-white hover:bg-red-700 focus:shadow-outline focus:outline-none"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link to="/" className="inline-flex items-center">
              <Droplet className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold tracking-wide text-gray-800">
                HeartBeat
              </span>
            </Link>
            <div className="mt-6 lg:max-w-sm">
              <p className="text-sm text-gray-700">
                HeartBeat is a platform dedicated to connecting blood donors with those in need, making the process of blood donation simple, efficient, and impactful.
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-base font-bold tracking-wide text-gray-900">
              Contacts
            </p>
            <div className="flex">
              <p className="mr-1 text-gray-700">Email:</p>
              <a
                href="mailto:info@heartbeat.org"
                className="text-red-600 transition-colors duration-300 hover:text-red-800"
              >
                info@heartbeat.org
              </a>
            </div>
            <div className="flex">
              <p className="mr-1 text-gray-700">Phone:</p>
              <a
                href="tel:+15555555555"
                className="text-red-600 transition-colors duration-300 hover:text-red-800"
              >
                +1 (555) 555-5555
              </a>
            </div>
          </div>
          <div>
            <p className="text-base font-bold tracking-wide text-gray-900">
              Quick Links
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/register"
                  className="text-red-600 transition-colors duration-300 hover:text-red-800"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-red-600 transition-colors duration-300 hover:text-red-800"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
          <p className="text-sm text-gray-600">
            © 2025 HeartBeat. All rights reserved.
          </p>
          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            <li>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-red-600"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors duration-300 hover:text-red-600"
              >
                Terms &amp; Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;