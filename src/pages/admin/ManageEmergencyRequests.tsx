import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Search, CheckCircle, XCircle, Clock, Filter, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageEmergencyRequests = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'all';
  const requestId = queryParams.get('id');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchRequests();
  }, [profile, statusFilter]);
  
  useEffect(() => {
    // If there's a specific request ID in the URL, highlight it
    if (requestId) {
      const element = document.getElementById(`request-${requestId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('bg-red-50');
        setTimeout(() => {
          element.classList.remove('bg-red-50');
        }, 3000);
      }
    }
  }, [requestId, requests]);
  
  const fetchRequests = async () => {
    if (!profile || !profile.is_admin) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('emergency_requests')
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
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      toast.error('Failed to load emergency requests');
    } finally {
      setLoading(false);
    }
  };
  
  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('emergency_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === id ? { ...request, status } : request
      ));
      
      toast.success(`Emergency request status updated to ${status}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" /> Fulfilled
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <XCircle className="h-4 w-4 mr-1" /> Closed
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" /> Open
          </span>
        );
    }
  };
  
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            High Urgency
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Medium Urgency
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Low Urgency
          </span>
        );
    }
  };
  
  const openGoogleMaps = (request: any) => {
    if (request.latitude && request.longitude) {
      const url = `https://www.google.com/maps?q=${request.latitude},${request.longitude}`;
      window.open(url, '_blank');
    } else if (request.hospital) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.hospital)}`;
      window.open(url, '_blank');
    }
  };
  
  const filteredRequests = requests.filter(request => {
    const patientName = request.patient_name.toLowerCase();
    const hospital = request.hospital.toLowerCase();
    const requesterName = `${request.profiles?.first_name} ${request.profiles?.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return patientName.includes(search) || hospital.includes(search) || requesterName.includes(search);
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
            Manage Emergency Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage emergency blood requests
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
                  placeholder="Search by patient name, hospital, or requester"
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
                  <option value="open">Open</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {filteredRequests.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <li key={request.id} id={`request-${request.id}`} className="transition-colors duration-300">
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
                          {request.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Blood Type: {request.blood_type} • {request.units_needed} units needed
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency_level)}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin 
                          className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 cursor-pointer" 
                          onClick={() => openGoogleMaps(request)}
                        />
                        <p className="cursor-pointer hover:text-red-600" onClick={() => openGoogleMaps(request)}>
                          {request.location_name || request.hospital}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Contact: {request.contact_number}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <p>
                          Requested by: {request.profiles?.first_name} {request.profiles?.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {request.status === 'open' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Mark as Fulfilled
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'closed')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Close Request
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
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'all' 
                ? `No emergency requests with status "${statusFilter}" found.` 
                : "No emergency requests match your search criteria."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmergencyRequests;