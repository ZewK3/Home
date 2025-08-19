import { useState, useEffect, useCallback } from 'react';
import { GPS_CONFIG, ERROR_MESSAGES } from '../utils/constants';

// Custom hook for GPS functionality
export const useGPS = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported('geolocation' in navigator);
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setPosition(coords);
          setIsLoading(false);
          resolve(coords);
        },
        (error) => {
          let errorMessage = ERROR_MESSAGES.GPS_ERROR;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = ERROR_MESSAGES.LOCATION_DENIED;
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Vị trí không khả dụng';
              break;
            case error.TIMEOUT:
              errorMessage = 'Hết thời gian chờ GPS';
              break;
            default:
              errorMessage = error.message || ERROR_MESSAGES.GPS_ERROR;
          }
          
          setError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: GPS_CONFIG.timeout,
          maximumAge: GPS_CONFIG.maximumAge,
        }
      );
    });
  }, [isSupported]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }, []);

  // Check if user is within store radius
  const checkStoreProximity = useCallback(async (storeCoords, allowedRadius = GPS_CONFIG.defaultRadius) => {
    try {
      const userPosition = await getCurrentPosition();
      
      if (!storeCoords || !storeCoords.latitude || !storeCoords.longitude) {
        throw new Error('Tọa độ cửa hàng không hợp lệ');
      }

      const distance = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        storeCoords.latitude,
        storeCoords.longitude
      );

      const isWithinRadius = distance <= allowedRadius;

      return {
        isWithinRadius,
        distance: Math.round(distance),
        userPosition,
        storeCoords,
        allowedRadius,
      };
    } catch (error) {
      throw error;
    }
  }, [getCurrentPosition, calculateDistance]);

  // Watch position (for real-time tracking)
  const watchPosition = useCallback((callback) => {
    if (!isSupported) {
      setError('Geolocation is not supported');
      return null;
    }

    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setPosition(coords);
        if (callback) callback(coords);
      },
      (error) => {
        let errorMessage = ERROR_MESSAGES.GPS_ERROR;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = ERROR_MESSAGES.LOCATION_DENIED;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Hết thời gian chờ GPS';
            break;
          default:
            errorMessage = error.message || ERROR_MESSAGES.GPS_ERROR;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_CONFIG.timeout,
        maximumAge: GPS_CONFIG.maximumAge,
      }
    );

    return watchId;
  }, [isSupported]);

  // Stop watching position
  const stopWatching = useCallback((watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Clear position and error
  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  return {
    position,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
    calculateDistance,
    checkStoreProximity,
    watchPosition,
    stopWatching,
    clearPosition,
  };
};

export default useGPS;