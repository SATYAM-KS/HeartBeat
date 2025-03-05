import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hi there! I'm Merry, your blood donation assistant. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  },
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic based on keywords
    const lowerCaseMessage = userMessage.toLowerCase();
    
    let response = '';
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = `Hello${profile?.first_name ? ` ${profile.first_name}` : ''}! How can I help you with blood donation today?`;
    } else if (lowerCaseMessage.includes('blood type') || lowerCaseMessage.includes('compatible')) {
      response = "Here's information about blood type compatibility:\n\n• Type O- can donate to all blood types\n• Type O+ can donate to O+, A+, B+, AB+\n• Type A- can donate to A-, A+, AB-, AB+\n• Type A+ can donate to A+, AB+\n• Type B- can donate to B-, B+, AB-, AB+\n• Type B+ can donate to B+, AB+\n• Type AB- can donate to AB-, AB+\n• Type AB+ can donate to AB+ only";
    } else if (lowerCaseMessage.includes('donate') || lowerCaseMessage.includes('donation')) {
      response = "To donate blood, you generally need to:\n\n1. Be at least 17 years old\n2. Weigh at least 110 pounds\n3. Be in good health\n4. Wait 56 days between whole blood donations\n\nYou can record your donation by clicking on 'Record Donation' in the dashboard!";
    } else if (lowerCaseMessage.includes('emergency') || lowerCaseMessage.includes('urgent')) {
      response = "For emergency blood requests, you can use the 'Create Emergency Request' feature. This will alert compatible donors in the area. Make sure to include accurate location information and contact details.";
    } else if (lowerCaseMessage.includes('thank')) {
      response = "You're welcome! I'm happy to help. Is there anything else you'd like to know about blood donation?";
    } else if (lowerCaseMessage.includes('eligib') || lowerCaseMessage.includes('can i donate')) {
      response = "Blood donation eligibility depends on several factors including age, weight, health status, and medical history. Generally, you should:\n\n• Be at least 17 years old\n• Weigh at least 110 pounds\n• Be in good health\n• Have adequate iron levels\n• Not have donated whole blood in the last 56 days\n\nSome medications and medical conditions may affect eligibility. It's best to check with your local donation center for specific requirements.";
    } else if (lowerCaseMessage.includes('benefit') || lowerCaseMessage.includes('why donate')) {
      response = "Donating blood has several benefits:\n\n• Saves lives - one donation can save up to 3 lives\n• Free health screening\n• Reduces risk of heart disease\n• Burns calories\n• Reduces iron stores which may lower risk of certain diseases\n\nMost importantly, you're helping someone in need!";
    } else if (lowerCaseMessage.includes('who are you') || lowerCaseMessage.includes('your name')) {
      response = "I'm Merry, your friendly blood donation assistant! I'm here to answer questions about blood donation, help you navigate the HeartBeat platform, and provide information about blood types and donation eligibility.";
    } else {
      response = "I'm not sure I understand. Would you like information about blood donation, eligibility requirements, or how to use the HeartBeat platform?";
    }
    
    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    const botResponse = await generateResponse(inputValue);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-200">
          {/* Chat header */}
          <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center mr-2">
                <MessageCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Mercy</h3>
                <p className="text-xs text-red-100">Blood Donation Assistant</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-red-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-3 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-3 text-left">
                <div className="inline-block px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;