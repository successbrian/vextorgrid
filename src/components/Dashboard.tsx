import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from './Card';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingWizard } from './OnboardingWizard';
import { TrueCPMCalculator } from './TrueCPMCalculator';
import { FleetReadiness } from './FleetReadiness';

interface Vehicle {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  vehicle_type: string;
  current_odometer: number;
  oil_change_interval: number;
  last_oil_change_odometer: number;
  usage_type: string;
}

export function Dashboard() {
  const { profile, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
    loadVehicles();
  }, [profile, user]);

  const checkOnboarding = () => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vextor_vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  const displayName = profile?.full_name || 'Operator';
  const userRole = profile?.user_role || 'personal';
  const isProfessional = userRole === 'professional' || userRole === 'fleet_manager';

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'monospace' }}>
          WELCOME BACK, {displayName.toUpperCase()}
        </h1>
        <div className="h-1 w-24 bg-[#FF4500]"></div>
      </div>

      {isProfessional && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'monospace' }}>
            MISSION PROFIT CALCULATOR
          </h2>
          <TrueCPMCalculator />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FleetReadiness />

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#008080] mb-2" style={{ fontFamily: 'monospace' }}>
              OPERATOR PROFILE
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">ROLE</span>
              <span className="text-white font-bold uppercase" style={{ fontFamily: 'monospace' }}>
                {userRole.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">VEHICLES</span>
              <span className="text-white font-bold" style={{ fontFamily: 'monospace' }}>
                {vehicles.length} / 4
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'monospace' }}>
              {isProfessional ? 'PROFESSIONAL MODE ACTIVE' : 'PERSONAL MODE ACTIVE'}
            </p>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#008080] mb-2" style={{ fontFamily: 'monospace' }}>
              MISSION STATUS
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 border-4 border-[#008080] rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#008080] rounded-full animate-pulse"></div>
                </div>
                <p className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
                  STANDING BY
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h3 className="text-lg font-bold text-[#FF4500] mb-4" style={{ fontFamily: 'monospace' }}>
            SYSTEM OVERVIEW
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-400 mb-3">ACTIVE MODULES</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
                  <span className="text-gray-300" style={{ fontFamily: 'monospace' }}>
                    DASHBOARD [ONLINE]
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
                  <span className="text-gray-300" style={{ fontFamily: 'monospace' }}>
                    VEHICLE GARAGE [ONLINE]
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
                  <span className="text-gray-300" style={{ fontFamily: 'monospace' }}>
                    FUEL LOG [ONLINE]
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
                  <span className="text-gray-300" style={{ fontFamily: 'monospace' }}>
                    GRID OPS [ONLINE]
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-3">QUICK TIPS</h4>
              <div className="space-y-2 text-sm text-gray-400">
                {vehicles.length === 0 ? (
                  <p>Add your first vehicle in the Vehicle Garage to get started.</p>
                ) : (
                  <>
                    <p>Log your fuel fill-ups in Grid Ops to track MPG automatically.</p>
                    {isProfessional && (
                      <p className="mt-2">Use the Mission Profit Calculator to analyze delivery profitability.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
