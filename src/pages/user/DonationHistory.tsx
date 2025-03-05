import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, Plus, Calendar, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const DonationHistory = () => {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from('blood_donations')
          .select('*')
          .eq('user_id', profile.id)
          .order('donation_date', { ascending: false });

        if (error) throw error;
        setDonations(data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [profile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" /> Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" /> Pending
          </span>
        );
    }
  };

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
            Your Donation History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your blood donation records
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/donations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record New Donation
          </Link>
        </div>
      </div>

      {donations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {donations.map((donation) => (
              <li key={donation.id}>
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
                          {donation.donation_center}
                        </div>
                        <div className="text-sm text-gray-500">
                          Blood Type: {donation.blood_type} • {donation.units} units
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      {getStatusBadge(donation.status)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {format(new Date(donation.donation_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {donation.donation_center}
                        </p>
                      </div>
                    </div>
                  </div>
                  {donation.notes && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{donation.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <Droplet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donations recorded</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't recorded any blood donations yet.
            </p>
            <div className="mt-6">
              <Link
                to="/donations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Your First Donation
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistory;