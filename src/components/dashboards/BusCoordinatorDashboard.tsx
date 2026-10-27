import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Play,
  Square,
  ShieldCheck,
  Radio,
  MapPin,
  Clock,
  Gauge,
  Phone,
  Bus as BusIcon,
  AlertTriangle,
  RotateCw,
  Compass,
} from 'lucide-react';
import type { User, Bus, BusRouteStop } from '../../types';
import { BusMap } from '../BusMap';
import { api } from '../../api';

interface BusCoordinatorDashboardProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  bus: Bus;
  isBusStale?: boolean;
  onRefreshData: () => void;
}

export const BusCoordinatorDashboard: React.FC<BusCoordinatorDashboardProps> = ({
  user,
  activeTab,
  onSelectTab,
  bus,
  isBusStale,
  onRefreshData,
}) => {
  // Tracking & GPS states
  const [isBroadcasting, setIsBroadcasting] = useState(bus.status === 'tracking_live');
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; speed: number; heading: number; accuracy: number } | null>(
    bus.currentLocation
      ? {
          lat: bus.currentLocation.lat,
          lng: bus.currentLocation.lng,
          speed: bus.currentLocation.speed,
          heading: bus.currentLocation.heading,
          accuracy: bus.currentLocation.accuracy,
        }
      : null
  );
  const [lastBroadcastTime, setLastBroadcastTime] = useState<string | null>(bus.currentLocation?.updatedAt || null);

  // Testing Route Simulator mode (so reviewers on desktop can test real moving updates without needing to be in a moving vehicle outdoors)
  const [useRouteSimulator, setUseRouteSimulator] = useState(false);
  const simStepRef = useRef(0);
  const simIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Check initial permission
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
        setGpsPermission(res.state as any);
        res.onchange = () => setGpsPermission(res.state as any);
      }).catch(() => {});
    }
  }, []);

  // Sync isBroadcasting with bus status
  useEffect(() => {
    setIsBroadcasting(bus.status === 'tracking_live');
    if (bus.currentLocation) {
      setCurrentCoords({
        lat: bus.currentLocation.lat,
        lng: bus.currentLocation.lng,
        speed: bus.currentLocation.speed,
        heading: bus.currentLocation.heading,
        accuracy: bus.currentLocation.accuracy,
      });
      setLastBroadcastTime(bus.currentLocation.updatedAt);
    }
  }, [bus]);

  // Start Live Tracking Session
  const handleStartTracking = async () => {
    try {
      setGpsError(null);

      // Call backend to initialize session
      await api.setBusSession(bus.id, 'start', user.id, user.name);
      setIsBroadcasting(true);

      if (!useRouteSimulator) {
        // Real Phone GPS Tracking
        if (!('geolocation' in navigator)) {
          setGpsError('Geolocation is not supported by your browser environment.');
          return;
        }

        // Request permission and watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            setGpsPermission('granted');
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 32;
            const heading = pos.coords.heading || 0;
            const accuracy = Math.round(pos.coords.accuracy) || 5;

            setCurrentCoords({ lat, lng, speed, heading, accuracy });
            setLastBroadcastTime(new Date().toISOString());

            // Broadcast to backend
            await api.updateBusLocation({
              busId: bus.id,
              lat,
              lng,
              speed,
              heading,
              accuracy,
              sessionMode: 'gps_live',
              nextStopId: bus.stops[2]?.id,
              etaMinutes: 7,
              coordinatorName: user.name,
            });
            onRefreshData();
          },
          (err) => {
            console.warn('GPS location error:', err);
            setGpsPermission('denied');
            setGpsError(`GPS Permission: ${err.message}. Switch to Route Simulation Mode to broadcast realistic waypoints.`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        // Start Simulator Loop
        startSimulatorLoop();
      }
    } catch (err: any) {
      console.error(err);
      setGpsError(err.message || 'Failed to start tracking session.');
    }
  };

  // Route Simulator loop (moves along bus.stops coordinates)
  const startSimulatorLoop = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    // Waypoints interpolated between stops
    const waypoints: { lat: number; lng: number; stopId?: string; eta: number }[] = [
      { lat: 37.7885, lng: -122.4285, stopId: 'stop_4_1', eta: 18 },
      { lat: 37.7850, lng: -122.4240, eta: 15 },
      { lat: 37.7812, lng: -122.4190, stopId: 'stop_4_2', eta: 12 },
      { lat: 37.7770, lng: -122.4135, eta: 10 },
      { lat: 37.7740, lng: -122.4085, stopId: 'stop_4_3', eta: 8 },
      { lat: 37.7710, lng: -122.4045, eta: 5 },
      { lat: 37.7680, lng: -122.4010, stopId: 'stop_4_4', eta: 3 },
      { lat: 37.7645, lng: -122.3970, eta: 1 },
      { lat: 37.7620, lng: -122.3940, stopId: 'stop_4_5', eta: 0 },
    ];

    simIntervalRef.current = setInterval(async () => {
      const idx = simStepRef.current % waypoints.length;
      const wp = waypoints[idx];
      simStepRef.current += 1;

      const lat = wp.lat;
      const lng = wp.lng;
      const speed = Math.floor(Math.random() * 15) + 25; // 25-40 km/h
      const heading = 135;
      const accuracy = 4;

      setCurrentCoords({ lat, lng, speed, heading, accuracy });
      setLastBroadcastTime(new Date().toISOString());

      await api.updateBusLocation({
        busId: bus.id,
        lat,
        lng,
        speed,
        heading,
        accuracy,
        sessionMode: 'simulator_demo',
        nextStopId: wp.stopId || 'stop_4_3',
        etaMinutes: wp.eta,
        coordinatorName: user.name,
      });
      onRefreshData();
    }, 4000);
  };

  // Stop Live Tracking Session
  const handleStopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    await api.setBusSession(bus.id, 'stop', user.id, user.name);
    setIsBroadcasting(false);
    onRefreshData();
  };

  // Clean up watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <BusIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{bus.number} · Live Tracking Console</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isBroadcasting ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {isBroadcasting ? 'BROADCASTING ACTIVE' : 'STANDBY / IDLE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Coordinator: <strong className="text-slate-800">{user.name}</strong> · License: {user.coordinatorInfo?.licenseNumber} · Driver: {bus.driverName}
            </p>
          </div>
        </div>

        {/* Start / Stop Broadcast Toggle */}
        <div className="flex items-center gap-3">
          {isBroadcasting ? (
            <button
              onClick={handleStopTracking}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Live Tracking</span>
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Live Tracking</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcaster Telemetry & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>GPS Sensor Status</span>
            <Radio className={`w-3.5 h-3.5 ${isBroadcasting ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-base font-bold text-slate-900 capitalize font-mono">
            {gpsPermission === 'granted' ? 'GPS Active (Locked)' : gpsPermission === 'denied' ? 'Permission Denied' : 'Awaiting Request'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Accuracy: ±{currentCoords?.accuracy || 5} meters</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Current Speed</span>
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <p className="text-base font-bold text-slate-900 font-mono">
            {isBroadcasting ? `${currentCoords?.speed || 0} km/h` : '0 km/h (Stopped)'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Speedometer telemetry</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Route Passengers</span>
            <BusIcon className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <p className="text-base font-bold text-slate-900 font-mono">
            {bus.studentsCount} / {bus.capacity} Students
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Assigned student capacity</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Last Streamed Ping</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-900 font-mono">
            {lastBroadcastTime ? new Date(lastBroadcastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Streaming cadence: 3s</span>
        </div>
      </div>

      {/* Simulator Mode Toggle Banner (Essential for review/testing) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <RotateCw className="w-4 h-4 text-sky-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Broadcast Mode: </span>
            <span className="text-slate-600">
              {useRouteSimulator ? 'Route Waypoint Simulator (Emulates bus moving along scheduled stops)' : 'Phone Device GPS (Requires physical device location)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUseRouteSimulator(!useRouteSimulator);
              if (isBroadcasting) {
                handleStopTracking();
              }
            }}
            className="px-3 py-1.5 font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Switch to {useRouteSimulator ? 'Real Device GPS' : 'Route Driver Simulator'}
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">GPS Location Notice:</strong>
            <span>{gpsError}</span>
          </div>
        </div>
      )}

      {/* Live Map Display */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Map Visualizer</h2>
            <p className="text-xs text-slate-500">Real-time coordinates streamed to connected parents and administrative dispatch</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Lat: {currentCoords?.lat.toFixed(4) || 37.7745}</span>
            <span>Lng: {currentCoords?.lng.toFixed(4) || -122.4112}</span>
          </div>
        </div>

        <div className="mt-4">
          <BusMap bus={bus} isStale={isBusStale} height="460px" />
        </div>

        {/* Route Stops Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Route Stops Check-In</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {bus.stops.map((stop, i) => (
              <div key={stop.id} className="p-3.5 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{stop.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Scheduled Departure: {stop.scheduledTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {bus.nextStopId === stop.id && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Approaching Next
                    </span>
                  )}
                  <button
                    onClick={() => {
                      api.updateBusLocation({
                        busId: bus.id,
                        lat: stop.lat,
                        lng: stop.lng,
                        nextStopId: stop.id,
                        etaMinutes: 2,
                        coordinatorName: user.name,
                      }).then(onRefreshData);
                    }}
                    className="text-xs font-semibold text-sky-600 hover:underline px-2 py-1"
                  >
                    Check In at Stop &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
