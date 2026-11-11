import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { Store, calculateTieredDeliveryFee } from '../types';

interface LatLng {
  lat: number;
  lng: number;
}

interface GoogleMapsDeliveryPickerProps {
  store: Store;
  selectedDistanceKm: number;
  onDistanceChange: (km: number, addressSnippet?: string) => void;
  currentAddress: string;
  onAddressChange: (address: string) => void;
}

// Coordinate helper for known store cities
const getStoreCoordinates = (city: string): LatLng => {
  const c = city.toLowerCase();
  if (c.includes('jogja') || c.includes('yogyakarta')) {
    return { lat: -7.761, lng: 110.3802 }; // Pogung Kaliurang
  }
  if (c.includes('bandung')) {
    return { lat: -6.9083, lng: 107.6186 }; // Jl Riau
  }
  // Default: Gandaria Jakarta Selatan
  return { lat: -6.2442, lng: 106.7932 };
};

// Haversine geodesic calculation fallback
const computeHaversineKm = (pos1: LatLng, pos2: LatLng): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Map Controller inside APIProvider to bind clicks and spherical calculations
const MapEventsHandler: React.FC<{
  storeCoords: LatLng;
  customerCoords: LatLng;
  onSelectLocation: (coords: LatLng, calculatedKm: number) => void;
}> = ({ storeCoords, customerCoords, onSelectLocation }) => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');

  // Handle click on map to set delivery location
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const clicked: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      let distKm = 1;
      if (geometryLib) {
        const storeLatLng = new google.maps.LatLng(storeCoords.lat, storeCoords.lng);
        const distanceMeters = geometryLib.spherical.computeDistanceBetween(
          storeLatLng,
          e.latLng
        );
        distKm = Math.max(0.5, Math.round((distanceMeters / 1000) * 10) / 10);
      } else {
        distKm = computeHaversineKm(storeCoords, clicked);
      }

      onSelectLocation(clicked, distKm);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, geometryLib, storeCoords, onSelectLocation]);

  // Fit bounds when coordinates change
  useEffect(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(storeCoords);
    bounds.extend(customerCoords);
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [map, storeCoords, customerCoords]);

  return null;
};

export const GoogleMapsDeliveryPicker: React.FC<GoogleMapsDeliveryPickerProps> = ({
  store,
  selectedDistanceKm,
  onDistanceChange,
  currentAddress,
  onAddressChange,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const storeCoords = useMemo(() => getStoreCoordinates(store.city), [store.city]);

  // Initial customer coordinates offset roughly by selectedDistanceKm
  const [customerCoords, setCustomerCoords] = useState<LatLng>(() => {
    // 0.009 deg lat ~ 1km
    const kmOffset = selectedDistanceKm * 0.009;
    return {
      lat: storeCoords.lat + kmOffset * 0.7,
      lng: storeCoords.lng + kmOffset * 0.7,
    };
  });

  const [exactGoogleMapsKm, setExactGoogleMapsKm] = useState<number>(selectedDistanceKm);

  // Popular destination presets in the store area for 1-click test
  const quickDestinations = useMemo(() => {
    const isJogja = store.city.toLowerCase().includes('jogja');
    const isBdg = store.city.toLowerCase().includes('bandung');

    if (isJogja) {
      return [
        { name: 'Pogung Baru (Dekat)', km: 1, lat: -7.758, lng: 110.378 },
        { name: 'UGM Sekip', km: 2, lat: -7.771, lng: 110.377 },
        { name: 'Gejayan / Affandi', km: 3, lat: -7.773, lng: 110.392 },
        { name: 'Seturan Raya', km: 4, lat: -7.772, lng: 110.409 },
        { name: 'Malioboro / Tugu', km: 5, lat: -7.789, lng: 110.366 },
      ];
    }
    if (isBdg) {
      return [
        { name: 'Jl. Progo / Trunojoyo', km: 1, lat: -6.904, lng: 110.615 },
        { name: 'Dago Bawah', km: 2, lat: -6.898, lng: 107.613 },
        { name: 'Cihampelas Walk', km: 3, lat: -6.894, lng: 107.604 },
        { name: 'Dipati Ukur (Unpad)', km: 4, lat: -6.885, lng: 107.615 },
        { name: 'Buah Batu / Lodaya', km: 5, lat: -6.932, lng: 107.625 },
      ];
    }
    // Jakarta Selatan (Gandaria)
    return [
      { name: 'Gandaria City Mall', km: 1, lat: -6.244, lng: 106.783 },
      { name: 'Kramat Pela / Barito', km: 2, lat: -6.245, lng: 106.797 },
      { name: 'Senopati & Blok M', km: 3, lat: -6.236, lng: 106.808 },
      { name: 'Pondok Indah Plaza', km: 4, lat: -6.269, lng: 106.782 },
      { name: 'SCBD Sudirman', km: 5, lat: -6.227, lng: 106.811 },
    ];
  }, [store.city]);

  const handleSelectCoords = useCallback(
    (coords: LatLng, calculatedKm: number) => {
      setCustomerCoords(coords);
      setExactGoogleMapsKm(calculatedKm);
      const roundedKm = Math.max(1, Math.ceil(calculatedKm));
      onDistanceChange(roundedKm);
    },
    [onDistanceChange]
  );

  const handlePresetClick = (preset: (typeof quickDestinations)[0]) => {
    setCustomerCoords({ lat: preset.lat, lng: preset.lng });
    setExactGoogleMapsKm(preset.km);
    onDistanceChange(preset.km, preset.name);
    if (!currentAddress.trim()) {
      onAddressChange(`${preset.name}, sekitar ${store.city}`);
    }
  };

  const tieredInfo = calculateTieredDeliveryFee(
    Math.max(1, Math.ceil(exactGoogleMapsKm)),
    store.deliveryPricing
  );

  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 space-y-3">
      {/* Header with Google Maps Live Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
            <Navigation className="w-3 h-3" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-stone-900 block leading-tight">
              Hitung Jarak Sesuai Google Maps
            </span>
            <span className="text-[10px] text-stone-500 block">
              Dari: {store.name} ({store.city})
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
            <Compass className="w-3 h-3 text-amber-800" />
            <span>±{exactGoogleMapsKm} KM</span>
          </span>
        </div>
      </div>

      {/* Google Maps Interactive Container */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-300/80 shadow-inner bg-stone-200">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['geometry', 'places']}>
            <Map
              defaultCenter={storeCoords}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              disableDefaultUI={true}
              zoomControl={true}
              className="w-full h-full"
            >
              {/* Store Marker (Green Pin) */}
              <AdvancedMarker position={storeCoords} title={`Toko: ${store.name}`}>
                <Pin background="#059669" glyphColor="#ffffff" borderColor="#047857" />
              </AdvancedMarker>

              {/* Customer Delivery Marker (Amber Pin) */}
              <AdvancedMarker
                position={customerCoords}
                title="Tujuan Pengantaran Customer"
              >
                <Pin background="#d97706" glyphColor="#ffffff" borderColor="#b45309" />
              </AdvancedMarker>

              <MapEventsHandler
                storeCoords={storeCoords}
                customerCoords={customerCoords}
                onSelectLocation={handleSelectCoords}
              />
            </Map>
          </APIProvider>
        ) : (
          /* Visual Interactive Canvas Mockup if Google Maps Key not injected */
          <div className="w-full h-full relative bg-radial from-stone-100 to-amber-50 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px]">
              <span className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md font-bold text-stone-700 border border-stone-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Toko: {store.address.slice(0, 24)}...
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                Google Maps GPS Active
              </span>
            </div>

            {/* Stylized Visual Route Line */}
            <div className="relative my-auto flex items-center justify-between px-6 py-2">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                  🏠
                </div>
                <span className="text-[10px] font-bold text-stone-800 mt-1">Toko</span>
              </div>

              {/* Route connecting line */}
              <div className="flex-1 mx-3 border-t-2 border-dashed border-amber-600 relative flex items-center justify-center">
                <span className="bg-amber-600 text-white font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  {exactGoogleMapsKm} KM
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white animate-bounce">
                  📍
                </div>
                <span className="text-[10px] font-bold text-stone-800 mt-1">Tujuan</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-500 text-center bg-white/70 backdrop-blur-xs py-1 rounded-md">
              💡 Klik tombol preset lokasi di bawah atau atur slider untuk menyesuaikan jarak Google Maps
            </p>
          </div>
        )}

        {/* Map Overlay Badge */}
        <div className="absolute bottom-2 left-2 pointer-events-none bg-stone-900/80 backdrop-blur-xs text-white text-[9.5px] px-2 py-0.5 rounded-md font-medium">
          Klik peta / pilih lokasi untuk ukur jarak
        </div>
      </div>

      {/* Preset Lokasi Sekitar Toko */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Pilih Lokasi Cepat Sekitar Toko:
          </span>
          <span className="text-stone-400 text-[10px]">Maks radius {store.deliveryRadiusKm} KM</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {quickDestinations.map((preset) => {
            const isSelected = Math.round(exactGoogleMapsKm) === preset.km;
            const fee = calculateTieredDeliveryFee(preset.km, store.deliveryPricing).fee;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 border-amber-700 text-white shadow-xs'
                    : 'bg-white border-stone-200 hover:border-amber-400 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate max-w-[110px]">{preset.name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-1 rounded ${
                      isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {preset.km} KM
                  </span>
                </div>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    isSelected ? 'text-amber-100 font-medium' : 'text-stone-500'
                  }`}
                >
                  Ongkir: Rp {fee.toLocaleString('id-ID')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance Slider for Manual Precision Tuning */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between items-center text-[11px] text-stone-600">
          <span>Atur Jarak Manual (Google Maps):</span>
          <span className="font-black text-amber-800 text-xs">
            {selectedDistanceKm} Kilometer
          </span>
        </div>
        <input
          type="range"
          min="1"
          max={Math.max(6, store.deliveryRadiusKm || 6)}
          step="1"
          value={selectedDistanceKm}
          onChange={(e) => {
            const val = Number(e.target.value);
            setExactGoogleMapsKm(val);
            onDistanceChange(val);
          }}
          className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
        />
      </div>

      {/* Tiered Formula Breakdown Card */}
      <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-amber-950">
          <span>Total Ongkir ({selectedDistanceKm} KM): Rp {tieredInfo.fee.toLocaleString('id-ID')}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Tarif Resmi
          </span>
        </div>
        <p className="text-[11px] text-stone-600 font-medium">
          Rincian: {tieredInfo.breakdown}
        </p>
        <p className="text-[9.5px] text-stone-400 border-t border-stone-100 pt-1 mt-1">
          📌 Aturan: KM ke-1 Rp 5.000 · KM ke-2 Rp 3.000 · KM ke-3 dst Flat Rp 2.000/km
        </p>
      </div>
    </div>
  );
};
