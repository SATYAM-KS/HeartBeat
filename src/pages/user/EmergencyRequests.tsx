import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Plus, Calendar, MapPin, Phone, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import StartChatButton from '../../components/StartChatButton';

const EmergencyRequests = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get('id');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!profile) return;

      try {
        // Fetch all open emergency requests
        const { data: allRequests, error: allError } = await supabase
          .from('emergency_requests')
          .select(`
            *,
            profiles:user_id (
              id,
              first_name,
              last_name,
              blood_type
            )
          `)
          .order('created_at', { ascending: false });

        if (allError) throw allError;
        setRequests(allRequests || []);

        // Fetch user's emergency requests
        const { data: userRequests, error: userError } = await supabase
          .from('emergency_requests')
          .select(`
            *,
            profiles:user_id (
              id,
              first_name,
              last_name,
              blood_type
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (userError) throw userError;
        setMyRequests(userRequests || []);
        
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
      } catch (error) {
        console.error('Error fetching emergency requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [profile, requestId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const displayRequests = activeTab === 'all' ? requests : myRequests;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Emergency Blood Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage emergency blood donation requests
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/emergency-requests/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Emergency Request
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`${
                activeTab === 'my'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              My Requests
            </button>
          </nav>
        </div>

        {displayRequests.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {displayRequests.map((request) => (
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
                          {request.hospital}
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
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Patient: {request.patient_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
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
                          {request.contact_number}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {request.notes && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{request.notes}</p>
                    </div>
                  )}
                  
                  {/* Requester info and chat button */}
                  {request.profiles && request.user_id !== profile?.id && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>
                          Requested by: {request.profiles.first_name} {request.profiles.last_name}
                        </span>
                      </div>
                      
                      <StartChatButton 
                        recipientId={request.user_id} 
                        recipientName={`${request.profiles.first_name}`}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'all' 
                ? "There are no emergency blood requests at the moment." 
                : "You haven't created any emergency requests yet."}
            </p>
            {activeTab === 'my' && (
              <div className="mt-6">
                <Link
                  to="/emergency-requests/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Emergency Request
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyRequests;