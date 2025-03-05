import React from 'react';
import { Award, Star, Shield, Trophy, Gift } from 'lucide-react';

interface RewardBadgeProps {
  level: string;
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
}

const RewardBadge: React.FC<RewardBadgeProps> = ({ 
  level, 
  points, 
  size = 'md',
  showPoints = true 
}) => {
  const getBadgeColor = () => {
    switch (level) {
      case 'Bronze':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Platinum':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Diamond':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getBadgeIcon = () => {
    switch (level) {
      case 'Bronze':
        return <Award className={`${getIconSize()} text-amber-600`} />;
      case 'Silver':
        return <Star className={`${getIconSize()} text-gray-600`} />;
      case 'Gold':
        return <Trophy className={`${getIconSize()} text-yellow-600`} />;
      case 'Platinum':
        return <Shield className={`${getIconSize()} text-blue-600`} />;
      case 'Diamond':
        return <Gift className={`${getIconSize()} text-purple-600`} />;
      default:
        return <Award className={`${getIconSize()} text-gray-600`} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3 mr-1';
      case 'lg':
        return 'h-5 w-5 mr-2';
      default:
        return 'h-4 w-4 mr-1.5';
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-xs px-2.5 py-1';
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full border ${getBadgeColor()} ${getBadgeSize()}`}>
      {getBadgeIcon()}
      <span className="font-medium">{level}</span>
      {showPoints && (
        <span className="ml-1 text-opacity-75">({points} pts)</span>
      )}
    </div>
  );
};

export default RewardBadge;