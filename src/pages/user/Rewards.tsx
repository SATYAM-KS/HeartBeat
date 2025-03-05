import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Award, Gift, Calendar, TrendingUp, Clock, CheckCircle, Medal } from 'lucide-react';
import { format } from 'date-fns';
import RewardBadge from '../../components/RewardBadge';

const Rewards = () => {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!profile) return;

      try {
        // Fetch user's rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        if (rewardsError) throw rewardsError;
        setRewards(rewardsData);

        // Fetch reward transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('reward_transactions')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [profile]);

  const getNextLevel = () => {
    if (!rewards) return { level: 'Silver', points: 100 };
    
    switch (rewards.level) {
      case 'Bronze':
        return { level: 'Silver', points: 500 };
      case 'Silver':
        return { level: 'Gold', points: 1000 };
      case 'Gold':
        return { level: 'Platinum', points: 2000 };
      case 'Platinum':
        return { level: 'Diamond', points: 5000 };
      default:
        return { level: 'Max Level', points: rewards.points };
    }
  };

  const getProgressPercentage = () => {
    if (!rewards) return 0;
    
    const nextLevel = getNextLevel();
    const prevLevelPoints = getPrevLevelPoints(rewards.level);
    
    if (rewards.level === 'Diamond') return 500;
    
    const pointsInCurrentLevel = rewards.points - prevLevelPoints;
    const pointsNeededForNextLevel = nextLevel.points - prevLevelPoints;
    
    return Math.min(Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100), 500);
  };

  const getPrevLevelPoints = (level: string) => {
    switch (level) {
      case 'Bronze':
        return 0;
      case 'Silver':
        return 500;
      case 'Gold':
        return 1000;
      case 'Platinum':
        return 2000;
      case 'Diamond':
        return 5000;
      default:
        return 0;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <Award className="h-5 w-5 text-red-600" />;
      case 'referral':
        return <Gift className="h-5 w-5 text-green-600" />;
      case 'emergency':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Medal className="h-5 w-5 text-purple-600" />;
    }
  };

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
            Your Rewards
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track your donation rewards and achievements
          </p>
        </div>
      </div>

      {rewards ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Rewards Summary Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Reward Status</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your current level and points</p>
              </div>
              <RewardBadge level={rewards.level} points={rewards.points} size="lg" />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress to {getNextLevel().level}</span>
                <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {rewards.level !== 'Diamond' ? (
                  <>You need {getNextLevel().points - rewards.points} more points to reach {getNextLevel().level} level.</>
                ) : (
                  <>You've reached the highest level! Congratulations!</>
                )}
              </p>

              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">How to Earn Points</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Award className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Donate blood: 100 points per unit</span>
                  </li>
                  <li className="flex items-start">
                    <Gift className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Refer a friend who donates: 50 points</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Respond to emergency requests: 150 points</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Level Benefits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <RewardBadge level="Bronze" points={0} size="sm" showPoints={false} />
                    <span className="ml-2">Basic donor recognition</span>
                  </li>
                  <li className="flex items-start">
                    <RewardBadge level="Silver" points={0} size="sm" showPoints={false} />
                    <span className="ml-2">Priority notification for blood drives</span>
                  </li>
                  <li className="flex items-start">
                    <RewardBadge level="Gold" points={0} size="sm" showPoints={false} />
                    <span className="ml-2">Exclusive donor events and recognition</span>
                  </li>
                  <li className="flex items-start">
                    <RewardBadge level="Platinum" points={0} size="sm" showPoints={false} />
                    <span className="ml-2">VIP donor status and special benefits</span>
                  </li>
                  <li className="flex items-start">
                    <RewardBadge level="Diamond" points={0} size="sm" showPoints={false} />
                    <span className="ml-2">Lifetime achievement recognition</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transactions History */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Point History</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your reward point transactions</p>
            </div>
            <div className="border-t border-gray-200">
              {transactions.length > 0 ? (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <li key={transaction.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description || 'Reward points'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          +{transaction.points} points
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start donating blood to earn reward points!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards found</h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't find your rewards information. Please try again later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;