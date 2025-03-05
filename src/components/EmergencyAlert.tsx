import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EmergencyAlertProps {
  onClose: () => void;
  emergency: {
    id: string;
    patient_name: string;
    blood_type: string;
    hospital: string;
    urgency_level: string;
  };
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ onClose, emergency }) => {
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-red-200 rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="bg-red-600 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium">Emergency Blood Request</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-red-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <p className="font-medium text-gray-900">{emergency.patient_name} needs {emergency.blood_type} blood</p>
        <p className="text-sm text-gray-600 mt-1">Location: {emergency.hospital}</p>
        <p className="text-sm mt-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            emergency.urgency_level === 'high' 
              ? 'bg-red-100 text-red-800' 
              : emergency.urgency_level === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {emergency.urgency_level.charAt(0).toUpperCase() + emergency.urgency_level.slice(1)} Urgency
          </span>
        </p>
        <div className="mt-4">
          <Link
            to={`/emergency-requests?id=${emergency.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export const EmergencyAlertListener: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    // Set up real-time subscription for emergency requests
    const subscription = supabase
      .channel('emergency_alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'emergency_requests',
        filter: 'status=eq.open'
      }, (payload) => {
        // Don't show alert for the user who created the request
        if (payload.new.user_id !== profile.id) {
          // Check if user's blood type matches the requested type (if profile has blood type)
          const shouldNotify = profile.is_admin || 
            (profile.blood_type && profile.blood_type === payload.new.blood_type);
          
          if (shouldNotify) {
            setAlerts(prev => [...prev, payload.new]);
            
            // Play sound alert
            const audio = new Audio('/alert-sound.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile]);

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert) => (
        <EmergencyAlert 
          key={alert.id} 
          emergency={alert} 
          onClose={() => removeAlert(alert.id)} 
        />
      ))}
    </>
  );
};

export default EmergencyAlert;