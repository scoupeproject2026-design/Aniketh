import React, { useEffect, useRef } from 'react';
import type { Bus, BusRouteStop } from '../types';

interface BusMapProps {
  bus: Bus;
  isStale?: boolean;
  height?: string;
  className?: string;
}

export const BusMap: React.FC<BusMapProps> = ({ bus, isStale, height = '460px', className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically access L (Leaflet)
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around bus or first stop
      const initialLat = bus.currentLocation?.lat || bus.stops[0]?.lat || 37.7745;
      const initialLng = bus.currentLocation?.lng || bus.stops[0]?.lng || -122.4112;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      // CartoDB Positron / OSM clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Render Stops & Route Polyline
    if (bus.stops && bus.stops.length > 0) {
      // Clear old stop markers
      stopMarkersRef.current.forEach((m) => map.removeLayer(m));
      stopMarkersRef.current = [];

      const routeCoords: [number, number][] = [];

      bus.stops.forEach((stop: BusRouteStop, index: number) => {
        routeCoords.push([stop.lat, stop.lng]);

        const isNextStop = bus.nextStopId === stop.id;
        const isTerminal = index === 0 || index === bus.stops.length - 1;

        const stopIconHtml = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full ${
            isNextStop
              ? 'bg-amber-500 text-white ring-4 ring-amber-200'
              : isTerminal
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-800 border-2 border-slate-700 shadow-sm'
          } font-bold text-xs">
            ${index + 1}
          </div>
        `;

        const stopIcon = L.divIcon({
          html: stopIconHtml,
          className: 'bus-marker-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1">
            <p class="font-bold text-slate-900 text-sm">${stop.name}</p>
            <p class="text-xs text-slate-600 mt-1">Scheduled Time: <span class="font-semibold text-slate-900">${stop.scheduledTime}</span></p>
            ${isNextStop ? '<p class="text-xs font-bold text-amber-600 mt-1">Next Approaching Stop</p>' : ''}
          </div>
        `);
        stopMarkersRef.current.push(marker);
      });

      // Route Polyline
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }
      routePolylineRef.current = L.polyline(routeCoords, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.7,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Render Live Bus Marker
    if (bus.currentLocation) {
      const busLat = bus.currentLocation.lat;
      const busLng = bus.currentLocation.lng;
      const isTracking = bus.status === 'tracking_live' && !isStale;

      const busIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="${isTracking ? 'bus-pulsing-badge' : 'w-9 h-9 rounded-full bg-slate-500 text-white flex items-center justify-center border-2 border-white shadow-md'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.7 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
            </svg>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            ${bus.number}
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        html: busIconHtml,
        className: 'bus-marker-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (!busMarkerRef.current) {
        busMarkerRef.current = L.marker([busLat, busLng], { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        busMarkerRef.current.setLatLng([busLat, busLng]);
        busMarkerRef.current.setIcon(busIcon);
      }

      busMarkerRef.current.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200">
            <span class="font-bold text-slate-900">${bus.number}</span>
            <span class="text-xs font-semibold ${isTracking ? 'text-emerald-600' : 'text-slate-500'}">
              ${isTracking ? 'LIVE EN ROUTE' : 'IDLE / OFFLINE'}
            </span>
          </div>
          <p class="text-xs text-slate-600 mt-1">${bus.routeName}</p>
          <div class="mt-2 text-xs grid grid-cols-2 gap-1 bg-slate-50 p-1.5 rounded">
            <div><span class="text-slate-500">Speed:</span> <span class="font-mono font-bold">${bus.currentLocation.speed} km/h</span></div>
            <div><span class="text-slate-500">Driver:</span> <span class="font-medium">${bus.driverName.split(' ')[0]}</span></div>
            <div><span class="text-slate-500">Accuracy:</span> <span class="font-mono">±${bus.currentLocation.accuracy}m</span></div>
            <div><span class="text-slate-500">ETA:</span> <span class="font-bold text-sky-700">${bus.etaMinutes ? `${bus.etaMinutes} min` : 'Calculating'}</span></div>
          </div>
        </div>
      `);

      if (isTracking) {
        map.panTo([busLat, busLng], { animate: true, duration: 1 });
      }
    }

    return () => {
      // Don't destroy on every re-render to keep map instance alive
    };
  }, [bus, isStale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${className}`} style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Status Card Overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/80 p-3 shadow-md text-xs max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${bus.status === 'tracking_live' && !isStale ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-bold text-slate-900">{bus.number} · {bus.routeName}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
          <span>Last GPS Update:</span>
          <span className="font-mono font-medium text-slate-700">
            {bus.currentLocation ? new Date(bus.currentLocation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
          </span>
        </div>
        {isStale && (
          <div className="mt-1.5 p-1 bg-amber-50 text-amber-800 rounded text-[11px] font-medium border border-amber-200">
            Location unavailable or stale (&gt; 3 mins without coordinator update)
          </div>
        )}
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 p-2 shadow-sm text-[11px] text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-sky-600" />
          <span>Active Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
          <span>Next Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-800 text-[9px] text-white flex items-center justify-center font-bold">1</div>
          <span>Stop</span>
        </div>
      </div>
    </div>
  );
};
