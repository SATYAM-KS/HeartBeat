import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, Search, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageDonations = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'all';
  
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchDonations();
  }, [profile, statusFilter]);
  
  const fetchDonations = async () => {
    if (!profile || !profile.is_admin) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('blood_donations')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };
  
  const updateDonationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('blood_donations')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setDonations(donations.map(donation => 
        donation.id === id ? { ...donation, status } : donation
      ));
      
      toast.success(`Donation status updated to ${status}`);
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error('Failed to update donation status');
    }
  };
  
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
  
  const filteredDonations = donations.filter(donation => {
    const donorName = `${donation.profiles?.first_name} ${donation.profiles?.last_name}`.toLowerCase();
    const center = donation.donation_center.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return donorName.includes(search) || center.includes(search);
  });
  
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
            Manage Donations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage blood donation records
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by donor name or donation center"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="status"
                  name="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {filteredDonations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredDonations.map((donation) => (
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
                          {donation.profiles?.first_name} {donation.profiles?.last_name}
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
                        <p>
                          Donation Date: {format(new Date(donation.donation_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <p>
                          Center: {donation.donation_center}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Submitted: {format(new Date(donation.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {donation.status === 'pending' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => updateDonationStatus(donation.id, 'completed')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => updateDonationStatus(donation.id, 'rejected')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </button>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'all' 
                ? `No donations with status "${statusFilter}" found.` 
                : "No donations match your search criteria."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDonations;