import { useState, useEffect } from 'react';
import { Card } from './Card';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from './Button';
import { MissionDebriefModal } from './MissionDebriefModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Mission {
  id: string;
  destination: string;
  offer_amount: number;
  estimated_miles: number;
  estimated_profit: number;
  created_at: string;
}

interface MissionControlProps {
  vehicleId: string;
  onMissionUpdate?: () => void;
}

export function MissionControl({ vehicleId, onMissionUpdate }: MissionControlProps) {
  const { user } = useAuth();
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && vehicleId) {
      loadActiveMissions();
    }
  }, [user, vehicleId]);

  const loadActiveMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('vextor_missions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveMissions(data || []);
    } catch (error) {
      console.error('Error loading active missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMission = async (missionId: string, actualMiles: number) => {
    try {
      const { error } = await supabase
        .from('vextor_missions')
        .update({
          status: 'completed',
          actual_miles: actualMiles,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;

      setActiveMissions(activeMissions.filter((m) => m.id !== missionId));
      setSelectedMission(null);

      if (onMissionUpdate) {
        onMissionUpdate();
      }
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (loading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-[#008080] mb-6" style={{ fontFamily: 'monospace' }}>
          ACTIVE MISSIONS
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500" style={{ fontFamily: 'monospace' }}>
            LOADING...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold text-[#008080] mb-6" style={{ fontFamily: 'monospace' }}>
          ACTIVE MISSIONS
        </h2>

        {activeMissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 border-4 border-[#333] rounded-full flex items-center justify-center mb-4 mx-auto">
              <MapPin size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-500" style={{ fontFamily: 'monospace' }}>
              NO ACTIVE MISSIONS
            </p>
            <p className="text-gray-600 text-sm mt-2">Accept a mission to begin tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-[#252525] border-2 border-[#008080] p-4 hover:border-[#00FF00] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={20} className="text-[#FF4500]" />
                      <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                        {mission.destination}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-[#00FF00]" />
                        <span className="text-gray-400">Pay:</span>
                        <span className="text-white font-bold">${mission.offer_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-[#FF4500]" />
                        <span className="text-gray-400">{getTimeElapsed(mission.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'monospace' }}>
                      EST. PROFIT
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        mission.estimated_profit > 0 ? 'text-[#00FF00]' : 'text-[#FF0000]'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      ${mission.estimated_profit.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#333]">
                  <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">EST. MILES</p>
                      <p className="text-white font-bold">{mission.estimated_miles}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">STATUS</p>
                      <p className="text-[#FF4500] font-bold">IN PROGRESS</p>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedMission(mission)} variant="secondary" className="whitespace-nowrap">
                    COMPLETE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedMission && (
        <MissionDebriefModal
          mission={selectedMission}
          onComplete={handleCompleteMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </>
  );
}
