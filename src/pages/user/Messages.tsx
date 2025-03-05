import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Send, User, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ChatRoom {
  id: string;
  last_message_at: string;
  participants: {
    id: string;
    user_id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  }[];
  last_message?: {
    message: string;
    created_at: string;
    sender_id: string;
  };
}

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

const Messages = () => {
  const { user, profile } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if there's a selected room in localStorage
    const storedRoom = localStorage.getItem('selected_chat_room');
    if (storedRoom) {
      setSelectedRoom(storedRoom);
      localStorage.removeItem('selected_chat_room');
    }
    
    fetchChatRooms();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        if (payload.new.chat_room_id === selectedRoom) {
          setMessages(prev => [...prev, payload.new as Message]);
          markMessagesAsRead(payload.new.chat_room_id);
        } else {
          // If message is for another room, refresh the chat rooms list
          fetchChatRooms();
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedRoom]);
  
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom);
      markMessagesAsRead(selectedRoom);
    }
  }, [selectedRoom]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchChatRooms = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all chat rooms where the user is a participant
      const { data: participantsData, error: participantsError } = await supabase
        .from('chat_participants')
        .select(`
          chat_room_id
        `)
        .eq('user_id', user.id);
      
      if (participantsError) throw participantsError;
      
      if (participantsData && participantsData.length > 0) {
        const roomIds = participantsData.map(p => p.chat_room_id);
        
        // Get chat room details with participants
        const { data: roomsData, error: roomsError } = await supabase
          .from('chat_rooms')
          .select(`
            id,
            last_message_at,
            participants:chat_participants(
              id,
              user_id,
              profile:profiles(
                first_name,
                last_name
              )
            )
          `)
          .in('id', roomIds)
          .order('last_message_at', { ascending: false });
        
        if (roomsError) throw roomsError;
        
        // Get the last message for each room
        const roomsWithLastMessage = await Promise.all(
          (roomsData || []).map(async (room) => {
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from('chat_messages')
              .select('message, created_at, sender_id')
              .eq('chat_room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (lastMessageError && lastMessageError.code !== 'PGRST116') {
              console.error('Error fetching last message:', lastMessageError);
            }
            
            return {
              ...room,
              last_message: lastMessageData || null
            };
          })
        );
        
        setChatRooms(roomsWithLastMessage);
      } else {
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const markMessagesAsRead = async (roomId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('chat_room_id', roomId)
        .neq('sender_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!user || !selectedRoom || !newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: selectedRoom,
          sender_id: user.id,
          message: newMessage.trim()
        });
      
      if (error) throw error;
      
      // Update the last_message_at timestamp for the chat room
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedRoom);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const getOtherParticipant = (room: ChatRoom) => {
    if (!user) return null;
    
    const otherParticipant = room.participants.find(
      p => p.user_id !== user.id
    );
    
    return otherParticipant;
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Messages
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect with donors and recipients
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Chat list */}
          <div className={`border-r border-gray-200 ${selectedRoom ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : chatRooms.length > 0 ? (
              <ul className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(600px - 65px)' }}>
                {chatRooms.map((room) => {
                  const otherParticipant = getOtherParticipant(room);
                  
                  return (
                    <li 
                      key={room.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedRoom === room.id ? 'bg-red-50' : ''}`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {otherParticipant?.profile?.first_name} {otherParticipant?.profile?.last_name}
                              </p>
                              {room.last_message && (
                                <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                  {room.last_message.sender_id === user?.id ? 'You: ' : ''}
                                  {room.last_message.message}
                                </p>
                              )}
                            </div>
                          </div>
                          {room.last_message && (
                            <div className="text-xs text-gray-500">
                              {formatMessageTime(room.last_message.created_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">No conversations yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your conversations with donors and recipients will appear here.
                </p>
              </div>
            )}
          </div>
          
          {/* Chat messages */}
          <div className={`col-span-2 flex flex-col ${!selectedRoom ? 'hidden md:flex md:items-center md:justify-center' : ''}`}>
            {selectedRoom ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button 
                    className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedRoom(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  {chatRooms.find(room => room.id === selectedRoom) && (
                    <>
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {getOtherParticipant(chatRooms.find(room => room.id === selectedRoom)!)?.profile?.first_name} {getOtherParticipant(chatRooms.find(room => room.id === selectedRoom)!)?.profile?.last_name}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id 
                                ? 'bg-red-600 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p>{message.message}</p>
                            <div 
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id ? 'text-red-100' : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-sm font-medium text-gray-900">No messages yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start the conversation by sending a message.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;