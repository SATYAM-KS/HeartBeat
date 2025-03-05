import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = [
  { value: 'high', label: 'High - Needed within 24 hours' },
  { value: 'medium', label: 'Medium - Needed within 48 hours' },
  { value: 'low', label: 'Low - Needed within a week' },
];

const NewEmergencyRequest = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    blood_type: '',
    units_needed: 1,
    hospital: '',
    patient_name: '',
    contact_number: profile?.phone || '',
    urgency_level: 'medium',
    notes: '',
    latitude: '',
    longitude: '',
    location_name: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const getLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    
    // Create a more accurate geolocation request with high accuracy and no caching
    const geoOptions = {
      enableHighAccuracy: true,  // Request the most accurate position available
      timeout: 30000,            // Longer timeout to allow for more accurate position
      maximumAge: 0              // Force fresh location data, don't use cached position
    };
    
    // Show a toast to inform the user that location detection is in progress
    toast.loading('Detecting your precise location...', { id: 'location-loading' });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Location detected with accuracy: ${accuracy} meters`);
        
        try {
          // Directly set the location coordinates
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Try to get a more readable location name using OpenStreetMap's Nominatim
          try {
            // Use zoom level 18 for more precise address details
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { 
                headers: { 
                  'Accept-Language': 'en',
                  'User-Agent': 'HeartBeat Blood Donation App' // Proper user-agent for Nominatim
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                // Update form with the location data
                setFormData(prev => ({
                  ...prev,
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                  location_name: data.display_name,
                  hospital: data.display_name // Automatically fill the hospital field
                }));
                
                toast.dismiss('location-loading');
                toast.success(`Location detected (accuracy: ${Math.round(accuracy)}m)`);
                setLocationLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching location name from Nominatim:', error);
            // Continue with coordinates if the reverse geocoding fails
          }
          
          // Fallback to coordinates if reverse geocoding fails
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            location_name: locationString,
            hospital: locationString // Automatically fill the hospital field with coordinates
          }));
          
          toast.dismiss('location-loading');
          toast.success(`Location coordinates detected (accuracy: ${Math.round(accuracy)}m)`);
        } catch (error) {
          console.error('Error in location processing:', error);
          toast.dismiss('location-loading');
          toast.error('Failed to process location data');
          setLocationError('Failed to process location data');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        toast.dismiss('location-loading');
        let errorMessage = 'Unable to retrieve your location.';
        
        // Provide more specific error messages based on the error code
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += ' Location access was denied. Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += ' Location information is unavailable. Please try again in a different area.';
            break;
          case error.TIMEOUT:
            errorMessage += ' The request to get your location timed out. Please try again.';
            break;
          default:
            errorMessage += ' Please allow location access or enter manually.';
        }
        
        setLocationError(errorMessage);
        setLocationLoading(false);
        toast.error('Location detection failed');
        console.error('Geolocation error:', error);
      },
      geoOptions
    );
  };
  
  const openGoogleMaps = () => {
    if (formData.latitude && formData.longitude) {
      const url = `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`;
      window.open(url, '_blank');
    } else if (formData.hospital) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.hospital)}`;
      window.open(url, '_blank');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!profile) {
      setError('User profile not found');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error: insertError } = await supabase
        .from('emergency_requests')
        .insert({
          user_id: profile.id,
          blood_type: formData.blood_type,
          units_needed: parseInt(formData.units_needed.toString()),
          hospital: formData.hospital,
          patient_name: formData.patient_name,
          contact_number: formData.contact_number,
          urgency_level: formData.urgency_level,
          notes: formData.notes,
          status: 'open',
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          location_name: formData.location_name || null,
        })
        .select();
      
      if (insertError) throw insertError;
      
      toast.success('Emergency request created successfully!');
      
      // Play alert sound to confirm the request was created
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      // Navigate to the emergency requests page with the new request ID
      if (data && data.length > 0) {
        navigate(`/emergency-requests?id=${data[0].id}`);
      } else {
        navigate('/emergency-requests');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create emergency request');
      toast.error('Failed to create emergency request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create Emergency Blood Request
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Request blood donation for emergency situations
          </p>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                  Blood Type Needed
                </label>
                <div className="mt-1">
                  <select
                    id="blood_type"
                    name="blood_type"
                    required
                    value={formData.blood_type}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="units_needed" className="block text-sm font-medium text-gray-700">
                  Units Needed
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="units_needed"
                    id="units_needed"
                    required
                    min="1"
                    max="20"
                    value={formData.units_needed}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                  Hospital / Medical Center Location
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="hospital"
                    id="hospital"
                    required
                    value={formData.hospital}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md pr-20"
                    placeholder="e.g., City General Hospital"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-1 h-8"
                    >
                      {locationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span className="ml-1">Get Location</span>
                    </button>
                  </div>
                </div>
                {locationError && (
                  <p className="mt-1 text-sm text-red-600">{locationError}</p>
                )}
                {formData.latitude && formData.longitude && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {formData.location_name || `${formData.latitude}, ${formData.longitude}`}
                    </p>
                    <button
                      type="button"
                      onClick={openGoogleMaps}
                      className="mt-1 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View on Google Maps
                    </button>
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">
                  Patient Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="patient_name"
                    id="patient_name"
                    required
                    value={formData.patient_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="contact_number"
                    id="contact_number"
                    required
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="urgency_level" className="block text-sm font-medium text-gray-700">
                  Urgency Level
                </label>
                <div className="mt-1">
                  <select
                    id="urgency_level"
                    name="urgency_level"
                    required
                    value={formData.urgency_level}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any additional information about the emergency"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/emergency-requests')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewEmergencyRequest;