import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CapturedPhoto {
  url: string;
  blob: Blob;
  timestamp: string;
}

export function useCamera() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (videoElement?: HTMLVideoElement) => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device');
        return false;
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      const video = videoElement || videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      
      setIsActive(true);
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access.');
      } else {
        setError('Could not access camera');
      }
      return false;
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const toggleFacingMode = useCallback(async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    
    if (isActive) {
      stopCamera();
      // Small delay to ensure camera is fully stopped
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [facingMode, isActive, startCamera, stopCamera]);

  const capturePhoto = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !streamRef.current) {
      toast.error('Camera not ready');
      return null;
    }
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    // Convert data URL to blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    
    const photo: CapturedPhoto = {
      url: dataUrl,
      blob,
      timestamp: new Date().toISOString()
    };
    
    setCapturedPhoto(photo);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
    
    return photo;
  }, []);

  const clearCapturedPhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  const uploadPhoto = useCallback(async (
    blob: Blob,
    propertyId: string,
    caption?: string
  ): Promise<{ url: string; thumbnailUrl: string } | null> => {
    if (!user) {
      toast.error('Please sign in to upload');
      return null;
    }

    setIsUploading(true);
    
    try {
      const fileName = `${user.id}/${propertyId}-${Date.now()}.jpg`;
      
      const { error } = await supabase.storage
        .from('d4d-photos')
        .upload(`photos/${fileName}`, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload photo');
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('d4d-photos')
        .getPublicUrl(`photos/${fileName}`);
      
      // For now, thumbnail is the same as the full image
      // In production, you'd generate a smaller version
      return {
        url: publicUrl,
        thumbnailUrl: publicUrl
      };
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  // Use native file input as fallback for devices where getUserMedia doesn't work well
  const captureWithNativeInput = useCallback((): Promise<CapturedPhoto | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const url = URL.createObjectURL(file);
        const photo: CapturedPhoto = {
          url,
          blob: file,
          timestamp: new Date().toISOString()
        };
        
        setCapturedPhoto(photo);
        
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);
        
        resolve(photo);
      };
      
      input.oncancel = () => resolve(null);
      
      input.click();
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    facingMode,
    capturedPhoto,
    isUploading,
    error,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    clearCapturedPhoto,
    uploadPhoto,
    captureWithNativeInput
  };
}
