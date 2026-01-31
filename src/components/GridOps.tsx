import { useState, useEffect } from 'react';
import { TrueCPMCalculator } from './TrueCPMCalculator';
import { FuelMileageLog } from './FuelMileageLog';
import { Analytics } from './Analytics';
import { Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './Card';

export function GridOps() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'calculator' | 'fuel-log' | 'analytics'>('fuel-log');

  useEffect(() => {
    const isProfessional = profile?.user_role === 'professional' || profile?.user_role === 'fleet_manager';
    if (!isProfessional) {
      setActiveTab('fuel-log');
    }
  }, [profile]);

  const isProfessional = profile?.user_role === 'professional' || profile?.user_role === 'fleet_manager';

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'monospace' }}>
          GRID OPS
        </h1>
        <div className="h-1 w-24 bg-[#FF4500]"></div>
      </div>

      {isProfessional && (
        <div className="mb-6">
          <div className="flex gap-2 bg-[#1a1a1a] border border-[#333] p-2">
            <button
              onClick={() => setActiveTab('fuel-log')}
              className={`flex-1 px-6 py-3 font-bold transition-colors ${
                activeTab === 'fuel-log'
                  ? 'bg-[#008080] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              FUEL & MILEAGE LOG
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-3 font-bold transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[#008080] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              ANALYTICS
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 px-6 py-3 font-bold transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-[#008080] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              MISSION CALCULATOR
            </button>
          </div>
        </div>
      )}

      {activeTab === 'fuel-log' && <FuelMileageLog />}
      {activeTab === 'analytics' && isProfessional && <Analytics />}
      {activeTab === 'calculator' && isProfessional && <TrueCPMCalculator />}
    </div>
  );
}
