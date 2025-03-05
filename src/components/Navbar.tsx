import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Droplet, Menu, User, LogOut, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [emergencyCount, setEmergencyCount] = React.useState(0);

  React.useEffect(() => {
    // Fetch open emergency requests count
    const fetchEmergencyCount = async () => {
      const { count, error } = await supabase
        .from('emergency_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      
      if (!error && count !== null) {
        setEmergencyCount(count);
      }
    };

    fetchEmergencyCount();

    // Set up real-time subscription for emergency requests
    const subscription = supabase
      .channel('emergency_changes_nav')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emergency_requests' 
      }, () => {
        fetchEmergencyCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <Droplet className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">HeartBeat</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {emergencyCount > 0 && (
              <Link to="/emergency-requests" className="mr-4 relative">
                <Bell className="h-6 w-6 text-red-600" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-medium text-red-600">{emergencyCount}</span>
                </span>
              </Link>
            )}
            
            {user && (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="ml-2 text-gray-700">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user.email}
                    </span>
                  </div>
                </button>
                
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            {emergencyCount > 0 && (
              <Link to="/emergency-requests" className="mr-4 relative">
                <Bell className="h-6 w-6 text-red-600" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-medium text-red-600">{emergencyCount}</span>
                </span>
              </Link>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 border-red-500 text-base font-medium text-red-700 bg-red-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/donations"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Donations
            </Link>
            <Link
              to="/emergency-requests"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 relative"
              onClick={() => setMobileMenuOpen(false)}
            >
              Emergency Requests
              {emergencyCount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xs font-medium text-red-600">{emergencyCount}</span>
                </span>
              )}
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                </div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Your Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;