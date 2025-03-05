import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, AlertCircle, Calendar, User, Activity, MessageCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import RewardBadge from '../../components/RewardBadge';

const Dashboard = () => {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    lastDonation: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      try {
        // Fetch user's donations
        const { data: donationsData, error: donationsError } = await supabase
          .from('blood_donations')
          .select('*')
          .eq('user_id', profile.id)
          .order('donation_date', { ascending: false })
          .limit(5);

        if (donationsError) throw donationsError;
        setDonations(donationsData || []);

        // Calculate stats
        if (donationsData && donationsData.length > 0) {
          const totalUnits = donationsData.reduce((sum, donation) => sum + donation.units, 0);
          const lastDonation = donationsData[0]?.donation_date || null;

          setStats({
            totalDonations: donationsData.length,
            totalUnits,
            lastDonation,
          });
        }

        // Fetch recent emergency requests
        const { data: emergenciesData, error: emergenciesError } = await supabase
          .from('emergency_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        if (emergenciesError) throw emergenciesError;
        setEmergencies(emergenciesData || []);
        
        // Fetch user's rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', profile.id)
          .single();
          
        if (!rewardsError) {
          setRewards(rewardsData);
        }
        
        // Fetch unread messages count
        const { data: participantsData } = await supabase
          .from('chat_participants')
          .select('chat_room_id')
          .eq('user_id', profile.id);
        
        if (participantsData && participantsData.length > 0) {
          const roomIds = participantsData.map(p => p.chat_room_id);
          
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .in('chat_room_id', roomIds)
            .eq('read', false)
            .neq('sender_id', profile.id);
          
          setUnreadMessages(count || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
            Welcome, {profile?.first_name || 'User'}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your blood type: {profile?.blood_type || 'Not specified'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Link
            to="/donations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Droplet className="h-4 w-4 mr-2" />
            Record Donation
          </Link>
          <Link
            to="/emergency-requests/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Request Emergency
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
        </div>

        {/* Total Units */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Units Donated</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalUnits}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Last Donation */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Last Donation</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.lastDonation 
                        ? format(new Date(stats.lastDonation), 'MMM d, yyyy') 
                        : 'No donations yet'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reward Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Reward Status</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {rewards ? (
                        <RewardBadge level={rewards.level} points={rewards.points} />
                      ) : (
                        'Not available'
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/rewards" className="font-medium text-red-600 hover:text-red-500">
                View rewards
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
            <Link to="/donations" className="text-sm text-red-600 hover:text-red-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {donations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {donations.map((donation) => (
                  <li key={donation.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Droplet className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donation_center}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(donation.donation_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {donation.units} units
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No donations recorded yet</p>
                <Link
                  to="/donations/new"
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Record your first donation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Emergency Requests</h3>
            <Link to="/emergency-requests" className="text-sm text-red-600 hover:text-red-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {emergencies.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {emergencies.map((emergency) => (
                  <li key={emergency.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {emergency.hospital}
                          </div>
                          <div className="text-sm text-gray-500">
                            Blood Type: {emergency.blood_type} • {emergency.units_needed} units needed
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          emergency.urgency_level === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : emergency.urgency_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {emergency.urgency_level} urgency
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No emergency requests at the moment</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Preview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
              {unreadMessages > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadMessages} new
                </span>
              )}
            </div>
            <Link to="/messages" className="text-sm text-red-600 hover:text-red-500">
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200 p-6 flex flex-col items-center justify-center text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900">
              {unreadMessages > 0 
                ? `You have ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}` 
                : 'No unread messages'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect with donors and recipients through our messaging system.
            </p>
            <Link
              to="/messages"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Go to Messages
            </Link>
          </div>
        </div>
        
        {/* Rewards Preview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Rewards</h3>
            <Link to="/rewards" className="text-sm text-red-600 hover:text-red-500">
              View details
            </Link>
          </div>
          <div className="border-t border-gray-200 p-6">
            {rewards ? (
              <div className="text-center">
                <Award className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <div className="mb-4">
                  <RewardBadge level={rewards.level} points={rewards.points} size="lg" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  You've earned {rewards.points} points through your donations.
                  {rewards.level !== 'Diamond' && ' Keep donating to reach the next level!'}
                </p>
                <Link
                  to="/rewards"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Award className="h-4 w-4 mr-2" />
                  View Rewards
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">No rewards yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start donating blood to earn reward points and badges!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;