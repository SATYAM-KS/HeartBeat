import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, AlertCircle, Users, Activity, Calendar, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEmergencyRequests: 0,
    openEmergencyRequests: 0,
    pendingDonations: 0,
  });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentEmergencies, setRecentEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile || !profile.is_admin) return;

      try {
        // Fetch stats
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: donationsCount } = await supabase
          .from('blood_donations')
          .select('*', { count: 'exact', head: true });

        const { count: emergenciesCount } = await supabase
          .from('emergency_requests')
          .select('*', { count: 'exact', head: true });

        const { count: openEmergenciesCount } = await supabase
          .from('emergency_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        const { count: pendingDonationsCount } = await supabase
          .from('blood_donations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalUsers: usersCount || 0,
          totalDonations: donationsCount || 0,
          totalEmergencyRequests: emergenciesCount || 0,
          openEmergencyRequests: openEmergenciesCount || 0,
          pendingDonations: pendingDonationsCount || 0,
        });

        // Fetch recent donations
        const { data: donationsData } = await supabase
          .from('blood_donations')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentDonations(donationsData || []);

        // Fetch recent emergency requests
        const { data: emergenciesData } = await supabase
          .from('emergency_requests')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentEmergencies(emergenciesData || []);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of the blood donation system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalUsers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-red-600 hover:text-red-500">
                View all users
              </Link>
            </div>
          </div>
        </div>

        {/* Total Donations */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Droplet className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalDonations}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/donations" className="font-medium text-red-600 hover:text-red-500">
                View all donations
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Emergency Requests</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalEmergencyRequests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/emergency-requests" className="font-medium text-red-600 hover:text-red-500">
                View all requests
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Donations */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Donations</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.pendingDonations}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/donations?status=pending" className="font-medium text-yellow-600 hover:text-yellow-500">
                Review pending donations
              </Link>
            </div>
          </div>
        </div>

        {/* Open Emergency Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Emergency Requests</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.openEmergencyRequests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/emergency-requests?status=open" className="font-medium text-yellow-600 hover:text-yellow-500">
                View open requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Donations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Donations</h3>
            <Link to="/admin/donations" className="text-sm text-red-600 hover:text-red-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {recentDonations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentDonations.map((donation) => (
                  <li key={donation.id}>
                    <Link to={`/admin/donations?id=${donation.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Droplet className="h-6 w-6 text-red-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {donation.profiles?.first_name} {donation.profiles?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {donation.blood_type} • {donation.units} units • {donation.donation_center}
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No donations recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Emergency Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Emergency Requests</h3>
            <Link to="/admin/emergency-requests" className="text-sm text-red-600 hover:text-red-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {recentEmergencies.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentEmergencies.map((emergency) => (
                  <li key={emergency.id}>
                    <Link to={`/admin/emergency-requests?id=${emergency.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {emergency.patient_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {emergency.blood_type} • {emergency.units_needed} units • {emergency.hospital}
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No emergency requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;