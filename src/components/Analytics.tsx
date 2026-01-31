import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
}

interface MpgData {
  date: string;
  mpg: number;
  displayDate: string;
}

export function Analytics() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [mpgData, setMpgData] = useState<MpgData[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [user]);

  useEffect(() => {
    if (selectedVehicleId) {
      loadMpgData();
    }
  }, [selectedVehicleId]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vextor_vehicles')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);

      if (data && data.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const loadMpgData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vextor_fuel_logs')
        .select('mpg, created_at')
        .eq('vehicle_id', selectedVehicleId)
        .not('mpg', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedData: MpgData[] = data.map((log) => ({
          date: log.created_at,
          mpg: log.mpg,
          displayDate: new Date(log.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }));

        setMpgData(formattedData);

        if (formattedData.length >= 3) {
          const recentMpg = formattedData.slice(-3).reduce((sum, d) => sum + d.mpg, 0) / 3;
          const olderMpg = formattedData.slice(-6, -3);
          if (olderMpg.length > 0) {
            const olderAvg = olderMpg.reduce((sum, d) => sum + d.mpg, 0) / olderMpg.length;
            const difference = ((recentMpg - olderAvg) / olderAvg) * 100;

            if (difference < -5) {
              setTrend('down');
            } else if (difference > 5) {
              setTrend('up');
            } else {
              setTrend('stable');
            }
          }
        }
      } else {
        setMpgData([]);
        setTrend('stable');
      }
    } catch (err) {
      console.error('Error loading MPG data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#252525] border-2 border-[#333] flex items-center justify-center mb-6 mx-auto">
              <Activity size={48} className="text-[#008080]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'monospace' }}>
              NO VEHICLES FOUND
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Please add a vehicle in the Vehicle Garage before viewing analytics.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Vehicle
        </label>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="w-full max-w-md px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:border-[#008080] focus:outline-none"
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      {trend === 'down' && mpgData.length >= 3 && (
        <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg flex items-start gap-3">
          <TrendingDown size={24} className="text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-red-400 font-bold mb-1" style={{ fontFamily: 'monospace' }}>
              EFFICIENCY DROPPING
            </h3>
            <p className="text-red-300 text-sm">
              Check Maintenance - Your MPG trend is declining. Consider inspecting tire pressure, air filter, and engine performance.
            </p>
          </div>
        </div>
      )}

      {trend === 'up' && mpgData.length >= 3 && (
        <div className="p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg flex items-start gap-3">
          <TrendingUp size={24} className="text-green-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-green-400 font-bold mb-1" style={{ fontFamily: 'monospace' }}>
              EFFICIENCY IMPROVING
            </h3>
            <p className="text-green-300 text-sm">
              Your MPG trend is improving. Great work maintaining your vehicle!
            </p>
          </div>
        </div>
      )}

      <Card>
        <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'monospace' }}>
          MPG TREND ANALYSIS
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading analytics...
          </div>
        ) : mpgData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No MPG data available yet. Start logging fuel to see your efficiency trends.</p>
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mpgData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#666"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#666"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  label={{ value: 'MPG', angle: -90, position: 'insideLeft', fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                  }}
                  labelStyle={{ color: '#008080' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="mpg"
                  stroke="#008080"
                  strokeWidth={3}
                  dot={{ fill: '#008080', r: 4 }}
                  activeDot={{ r: 6, fill: '#FF4500' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {mpgData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#252525] border border-[#333] p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'monospace' }}>
                AVERAGE MPG
              </div>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
                {(mpgData.reduce((sum, d) => sum + d.mpg, 0) / mpgData.length).toFixed(1)}
              </div>
            </div>

            <div className="bg-[#252525] border border-[#333] p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'monospace' }}>
                BEST MPG
              </div>
              <div className="text-2xl font-bold text-[#008080]" style={{ fontFamily: 'monospace' }}>
                {Math.max(...mpgData.map(d => d.mpg)).toFixed(1)}
              </div>
            </div>

            <div className="bg-[#252525] border border-[#333] p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'monospace' }}>
                WORST MPG
              </div>
              <div className="text-2xl font-bold text-[#FF4500]" style={{ fontFamily: 'monospace' }}>
                {Math.min(...mpgData.map(d => d.mpg)).toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
