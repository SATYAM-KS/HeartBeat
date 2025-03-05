import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Droplet, 
  AlertCircle, 
  User, 
  Users, 
  ClipboardList, 
  Settings,
  Bell,
  Award,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin }) => {
  const location = useLocation();
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  useEffect(() => {
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

    // Fetch unread messages count
    const fetchUnreadMessagesCount = async () => {
      const { data: participantsData } = await supabase
        .from('chat_participants')
        .select('chat_room_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
      
      if (participantsData && participantsData.length > 0) {
        const roomIds = participantsData.map(p => p.chat_room_id);
        
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .in('chat_room_id', roomIds)
          .eq('read', false)
          .neq('sender_id', (await supabase.auth.getUser()).data.user?.id || '');
        
        setUnreadMessages(count || 0);
      }
    };

    fetchEmergencyCount();
    fetchUnreadMessagesCount();

    // Set up real-time subscription for emergency requests
    const emergencySubscription = supabase
      .channel('emergency_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emergency_requests' 
      }, () => {
        fetchEmergencyCount();
      })
      .subscribe();
    
    // Set up real-time subscription for chat messages
    const chatSubscription = supabase
      .channel('chat_message_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, () => {
        fetchUnreadMessagesCount();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'chat_messages',
        filter: 'read=eq.true'
      }, () => {
        fetchUnreadMessagesCount();
      })
      .subscribe();

    return () => {
      emergencySubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  }, []);
  
  const userLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { 
      name: 'My Donations', 
      icon: Droplet, 
      path: '/donations' 
    },
    { 
      name: 'Emergency Requests', 
      icon: AlertCircle, 
      path: '/emergency-requests',
      alert: emergencyCount > 0,
      alertCount: emergencyCount
    },
    { 
      name: 'Messages', 
      icon: MessageCircle, 
      path: '/messages',
      alert: unreadMessages > 0,
      alertCount: unreadMessages
    },
    { 
      name: 'Rewards', 
      icon: Award, 
      path: '/rewards'
    },
    { name: 'My Profile', icon: User, path: '/profile' },
  ];
  
  const adminLinks = [
    { name: 'Admin Dashboard', icon: Settings, path: '/admin' },
    { name: 'Manage Users', icon: Users, path: '/admin/users' },
    { name: 'Manage Donations', icon: Droplet, path: '/admin/donations' },
    { 
      name: 'Manage Emergencies', 
      icon: ClipboardList, 
      path: '/admin/emergency-requests',
      alert: emergencyCount > 0,
      alertCount: emergencyCount
    },
  ];
  
  const links = isAdmin ? [...userLinks, ...adminLinks] : userLinks;
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-2 space-y-1 bg-white">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md relative`}
                  >
                    <link.icon
                      className={`${
                        isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {link.name}
                    
                    {link.alert && (
                      <span className="absolute right-2 flex items-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                          <span className="text-xs font-medium text-red-600">{link.alertCount}</span>
                        </span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;