import { useState } from 'react';
import { Button } from './Button';
import { Camera, CheckCircle } from 'lucide-react';

interface MissionDebriefModalProps {
  mission: {
    id: string;
    destination: string;
    estimated_miles: number;
  };
  onComplete: (missionId: string, actualMiles: number) => void;
  onClose: () => void;
}

export function MissionDebriefModal({ mission, onComplete, onClose }: MissionDebriefModalProps) {
  const [actualMiles, setActualMiles] = useState(mission.estimated_miles.toString());

  const handleSubmit = () => {
    const miles = parseFloat(actualMiles);
    if (!miles || miles <= 0) return;
    onComplete(mission.id, miles);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border-4 border-[#00FF00] max-w-2xl w-full">
        <div className="bg-[#00FF00] p-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} className="text-black" />
            <h3 className="text-xl font-bold text-black" style={{ fontFamily: 'monospace' }}>
              MISSION DEBRIEF
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-white text-lg mb-2" style={{ fontFamily: 'monospace' }}>
              DESTINATION: {mission.destination}
            </h4>
            <p className="text-gray-400 text-sm">
              Estimated Miles: <span className="text-[#FF4500]">{mission.estimated_miles}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2" style={{ fontFamily: 'monospace' }}>
                ACTUAL MILEAGE (FINAL)
              </label>
              <input
                type="number"
                step="0.1"
                value={actualMiles}
                onChange={(e) => setActualMiles(e.target.value)}
                placeholder={mission.estimated_miles.toString()}
                className="w-full bg-[#252525] border-2 border-[#008080] text-white px-4 py-3 focus:outline-none focus:border-[#00FF00] transition-colors"
                style={{ fontFamily: 'monospace' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the actual miles driven to calculate final profit
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2" style={{ fontFamily: 'monospace' }}>
                PROOF OF DELIVERY / RECEIPT
              </label>
              <div className="border-2 border-dashed border-[#333] bg-[#252525] p-8 text-center hover:border-[#008080] transition-colors cursor-pointer">
                <Camera size={48} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 mb-2" style={{ fontFamily: 'monospace' }}>
                  UPLOAD EVIDENCE
                </p>
                <p className="text-xs text-gray-500">Photo Upload Feature</p>
                <div className="mt-3 bg-[#1a1a1a] border border-[#333] p-2 inline-block">
                  <p className="text-[#008080] text-xs font-bold" style={{ fontFamily: 'monospace' }}>
                    [COMING SOON]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} variant="secondary" className="flex-1">
              COMPLETE MISSION
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
