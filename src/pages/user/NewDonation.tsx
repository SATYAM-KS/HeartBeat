import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Droplet, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NewDonation = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    blood_type: profile?.blood_type || '',
    donation_date: new Date().toISOString().split('T')[0],
    donation_center: '',
    units: 1,
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      // Insert donation record
      const { error: insertError } = await supabase
        .from('blood_donations')
        .insert({
          user_id: profile.id,
          blood_type: formData.blood_type,
          donation_date: formData.donation_date,
          donation_center: formData.donation_center,
          units: parseInt(formData.units.toString()),
          notes: formData.notes,
          status: 'pending',
        });
      
      if (insertError) throw insertError;
      
      // Update profile with last donation date
      await supabase
        .from('profiles')
        .update({ 
          last_donation_date: formData.donation_date,
          blood_type: formData.blood_type || profile.blood_type
        })
        .eq('id', profile.id);
      
      // Refresh profile data
      await refreshProfile();
      
      toast.success('Donation recorded successfully!');
      navigate('/donations');
    } catch (error: any) {
      setError(error.message || 'Failed to record donation');
      toast.error('Failed to record donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Record New Donation
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add details about your blood donation
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
                  Blood Type
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
                <label htmlFor="donation_date" className="block text-sm font-medium text-gray-700">
                  Donation Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="donation_date"
                    id="donation_date"
                    required
                    value={formData.donation_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="donation_center" className="block text-sm font-medium text-gray-700">
                  Donation Center
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="donation_center"
                    id="donation_center"
                    required
                    value={formData.donation_center}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., City Blood Bank, Red Cross Center"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                  Units Donated
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="units"
                    id="units"
                    required
                    min="1"
                    max="10"
                    value={formData.units}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any additional information about your donation"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/donations')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewDonation;