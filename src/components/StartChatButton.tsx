import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StartChatButtonProps {
  recipientId: string;
  recipientName?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

const StartChatButton: React.FC<StartChatButtonProps> = ({
  recipientId,
  recipientName,
  className = '',
  variant = 'primary',
  size = 'md',
  iconOnly = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getButtonClasses = () => {
    let baseClasses = 'inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ';
    
    // Variant classes
    if (variant === 'primary') {
      baseClasses += 'bg-red-600 hover:bg-red-700 text-white ';
    } else if (variant === 'secondary') {
      baseClasses += 'bg-red-100 hover:bg-red-200 text-red-700 ';
    } else if (variant === 'outline') {
      baseClasses += 'border border-red-600 text-red-600 hover:bg-red-50 ';
    }
    
    // Size classes
    if (size === 'sm') {
      baseClasses += iconOnly ? 'p-1.5 ' : 'px-2.5 py-1.5 text-xs ';
    } else if (size === 'lg') {
      baseClasses += iconOnly ? 'p-3 ' : 'px-4 py-2 text-base ';
    } else {
      baseClasses += iconOnly ? 'p-2 ' : 'px-3 py-2 text-sm ';
    }
    
    return baseClasses + className;
  };

  const handleStartChat = async () => {
    if (!user || !recipientId || user.id === recipientId) return;
    
    setLoading(true);
    
    try {
      // Call the function to get or create a chat room
      const { data, error } = await supabase.rpc(
        'get_or_create_chat_room',
        { 
          user1_id: user.id,
          user2_id: recipientId
        }
      );
      
      if (error) throw error;
      
      // Navigate to the messages page
      navigate('/messages');
      
      // Small delay to allow the messages page to load
      setTimeout(() => {
        // Find a way to select the chat room
        // This could be done by storing the chat room ID in local storage
        // or by passing it as a URL parameter
        localStorage.setItem('selected_chat_room', data);
      }, 500);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={getButtonClasses()}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${iconOnly ? '' : 'mr-2'} h-4 w-4`} />
      ) : (
        <MessageCircle className={`${iconOnly ? '' : 'mr-2'} h-4 w-4`} />
      )}
      {!iconOnly && (recipientName ? `Message ${recipientName}` : 'Start Chat')}
    </button>
  );
};

export default StartChatButton;