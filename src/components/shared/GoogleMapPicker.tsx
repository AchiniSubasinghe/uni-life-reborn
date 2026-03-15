"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

interface GoogleMapPickerProps {
  latitude: number;
  longitude: number;
  address?: string;
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  }) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo
let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[data-google-maps="true"]'
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
}

export function GoogleMapPicker({
  latitude,
  longitude,
  address,
  onLocationChange,
}: GoogleMapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const center = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      if (!apiKey) {
        setError("Google Maps key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
        setLoading(false);
        return;
      }

      try {
        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !mapContainerRef.current || !window.google?.maps) {
          return;
        }

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: latitude && longitude ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const marker = new window.google.maps.Marker({
          map,
          position: center,
          draggable: true,
          visible: !!(latitude && longitude),
        });

        const geocoder = new window.google.maps.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        const updateLocation = (lat: number, lng: number, formattedAddress?: string) => {
          setError("");
          marker.setVisible(true);
          marker.setPosition({ lat, lng });
          map.panTo({ lat, lng });
          onLocationChange({ latitude: lat, longitude: lng, formattedAddress });
        };

        const reverseGeocode = (lat: number, lng: number) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
            if (status === "OK" && results?.[0]) {
              updateLocation(lat, lng, results[0].formatted_address);
            } else {
              updateLocation(lat, lng);
            }
          });
        };

        map.addListener("click", (event: any) => {
          const lat = event?.latLng?.lat?.();
          const lng = event?.latLng?.lng?.();
          if (typeof lat === "number" && typeof lng === "number") {
            reverseGeocode(lat, lng);
          }
        });

        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (!position) return;
          const lat = position.lat();
          const lng = position.lng();
          reverseGeocode(lat, lng);
        });

        if (searchInputRef.current && window.google.maps.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ["formatted_address", "geometry", "name"],
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const lat = place?.geometry?.location?.lat?.();
            const lng = place?.geometry?.location?.lng?.();

            if (typeof lat === "number" && typeof lng === "number") {
              updateLocation(lat, lng, place.formatted_address || place.name);
              map.setZoom(16);
            }
          });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Unable to load Google Maps. Please try again later.");
          setLoading(false);
        }
      }
    }

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, center, latitude, longitude, onLocationChange]);

  const handleUseCurrentLocation = () => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Current location requires a secure context (HTTPS or localhost).");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);
        }

        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results: any, status: string) => {
              onLocationChange({
                latitude: lat,
                longitude: lng,
                formattedAddress:
                  status === "OK" && results?.[0] ? results[0].formatted_address : undefined,
              });

              if (markerRef.current) {
                markerRef.current.setVisible(true);
                markerRef.current.setPosition({ lat, lng });
              }
            }
          );
        } else {
          onLocationChange({ latitude: lat, longitude: lng });
        }
      },
      (geoError) => {
        switch (geoError.code) {
          case 1:
            setError("Location permission was denied. Please allow location access in your browser.");
            break;
          case 2:
            setError("Your location is currently unavailable. Try again in a few seconds.");
            break;
          case 3:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("Unable to fetch your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (!apiKey) {
    return (
      <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
        <p className="text-sm text-destructive">
          Google Maps is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={searchInputRef}
          placeholder="Search business location"
          defaultValue={address || ""}
        />
        <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
          <MapPin className="h-4 w-4 mr-2" />
          Use Current
        </Button>
      </div>

      <div className="relative h-72 w-full rounded-lg border overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <FieldDescription>
        Click on the map, drag the marker, or search to set the exact business location.
      </FieldDescription>
    </div>
  );
}
