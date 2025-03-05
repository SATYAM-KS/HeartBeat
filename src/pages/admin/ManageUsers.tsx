import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Search, User, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, [profile]);
  
  const fetchUsers = async () => {
    if (!profile || !profile.is_admin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));
      
      toast.success(`User admin status ${!currentStatus ? 'granted' : 'revoked'}`);
    } catch (error) {
      console.error('Error updating user admin status:', error);
      toast.error('Failed to update user admin status');
    }
  };
  
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search);
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
            Manage Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user accounts
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Users
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
                placeholder="Search by name"
              />
            </div>
          </div>
        </div>
      </div>
      
      {filteredUsers.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Blood Type: {user.blood_type || 'Not specified'}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      {user.is_admin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          <Shield className="h-4 w-4 mr-1" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            Phone: {user.phone}
                          </p>
                        </div>
                      )}
                      {user.city && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <p>
                            Location: {user.city}, {user.state}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Joined: {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Don't allow toggling admin status for the current user */}
                  {user.id !== profile?.id && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                          user.is_admin 
                            ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500' 
                            : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" /> Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" /> Make Admin
                          </>
                        )}
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
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No users match your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;