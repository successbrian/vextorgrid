import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ClockConfig {
  timezone: string;
  label: string;
  timeFormat?: '12h' | '24h';
}

interface WeatherData {
  temp: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'wind';
  location: string;
}

export function CommandHUD() {
  const { user } = useAuth();
  const [activeUserCount, setActiveUserCount] = useState<number>(0);
  const [clockConfig, setClockConfig] = useState<ClockConfig[]>([]);
  const [weather, setWeather] = useState<WeatherData>({
    temp: 72,
    condition: 'clear',
    location: 'Home Base'
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadUserProfile();
    loadActiveUsers();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const activeInterval = setInterval(loadActiveUsers, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(activeInterval);
    };
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('vextor_profiles')
      .select('home_zip_code, clock_config')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setClockConfig(data.clock_config || []);
      if (data.home_zip_code) {
        loadWeather(data.home_zip_code);
      }
    }
  };

  const loadWeather = async (zipCode: string) => {
    try {
      console.log('Loading weather for zip:', zipCode);
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-weather`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ zipCode }),
      });

      console.log('Weather API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeather(data);
      } else {
        const errorData = await response.text();
        console.error('Weather API error:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  };

  const loadActiveUsers = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('vextor_profiles')
      .select('id')
      .gte('last_active_at', thirtyMinutesAgo);

    if (!error && data) {
      setActiveUserCount(data.length);
    }
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'rain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4 text-blue-200" />;
      case 'wind':
        return <Wind className="w-4 h-4 text-gray-400" />;
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-gray-400" />;
      case 'clear':
      default:
        return <Sun className="w-4 h-4 text-yellow-400" />;
    }
  };

  const formatTime = (date: Date, timezone?: string, timeFormat: '12h' | '24h' = '24h'): { time: string; day: string } => {
    const is12Hour = timeFormat === '12h';
    try {
      const dayOfWeek = date.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
      }).toUpperCase();

      const time = date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: is12Hour,
      });

      return { time, day: dayOfWeek };
    } catch {
      const dayOfWeek = date.toLocaleDateString('en-US', {
        weekday: 'short',
      }).toUpperCase();

      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: is12Hour,
      });

      return { time, day: dayOfWeek };
    }
  };

  return (
    <div className="bg-[#0a0a0a] border-b border-[#008080] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            {getWeatherIcon()}
            <span className="text-[#00FF00] font-bold text-sm" style={{ fontFamily: 'monospace' }}>
              {weather.temp}°F
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
            <div className="flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] rounded border border-gray-700">
              <span className="text-[#008080] text-xs uppercase mr-2" style={{ fontFamily: 'monospace' }}>
                LOCAL
              </span>
              <span className="text-[#00FF00] text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                {formatTime(currentTime).time}
              </span>
              <span className="text-[#008080] text-xs ml-1" style={{ fontFamily: 'monospace' }}>
                {formatTime(currentTime).day}
              </span>
            </div>

            {clockConfig.map((clock, index) => {
              const { time, day } = formatTime(currentTime, clock.timezone, clock.timeFormat || '24h');
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] rounded border border-gray-700"
                >
                  <span className="text-[#008080] text-xs uppercase mr-2" style={{ fontFamily: 'monospace' }}>
                    {clock.label}
                  </span>
                  <span className="text-[#00FF00] text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                    {time}
                  </span>
                  <span className="text-[#008080] text-xs ml-1" style={{ fontFamily: 'monospace' }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse"></div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#008080]" />
              <span className="text-[#00FF00] font-bold text-sm" style={{ fontFamily: 'monospace' }}>
                {activeUserCount}
              </span>
              <span className="text-gray-500 text-xs hidden sm:inline" style={{ fontFamily: 'monospace' }}>
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
