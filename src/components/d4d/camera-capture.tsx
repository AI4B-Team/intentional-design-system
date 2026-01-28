import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Check, RotateCcw, SwitchCamera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  isUploading?: boolean;
}

export function CameraCapture({ onCapture, onClose, isUploading }: CameraCaptureProps) {
  const [mode, setMode] = useState<'camera' | 'preview'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setIsStarting(true);
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsStarting(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
      setIsStarting(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    // Convert to blob
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    
    setCapturedImage(dataUrl);
    setCapturedBlob(blob);
    setMode('preview');
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setMode('camera');
  };

  // Confirm and upload photo
  const confirmPhoto = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  };

  // Toggle front/back camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Start camera on mount and when facing mode changes
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Handle close
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {mode === 'camera' ? (
        <>
          {/* Camera preview */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                facingMode === 'user' && "scale-x-[-1]"
              )}
              autoPlay
              playsInline
              muted
            />
            
            {/* Loading state */}
            {isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black p-4">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-white mb-4">{error}</p>
                  <Button onClick={handleClose}>Close</Button>
                </div>
              </div>
            )}
            
            {/* Timestamp overlay */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-black py-6 px-4 pb-safe">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {/* Close */}
              <button
                onClick={handleClose}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              
              {/* Capture */}
              <button
                onClick={capturePhoto}
                disabled={isStarting || !!error}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </button>
              
              {/* Flip camera */}
              <button
                onClick={toggleCamera}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
              >
                <SwitchCamera className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Preview captured image */}
          <div className="flex-1 relative">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  facingMode === 'user' && "scale-x-[-1]"
                )}
              />
            )}
          </div>
          
          {/* Preview controls */}
          <div className="bg-black py-6 px-4 pb-safe">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {/* Retake */}
              <button
                onClick={retakePhoto}
                disabled={isUploading}
                className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center disabled:opacity-50"
              >
                <RotateCcw className="h-7 w-7 text-white" />
              </button>
              
              {/* Confirm */}
              <button
                onClick={confirmPhoto}
                disabled={isUploading}
                className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                ) : (
                  <Check className="h-7 w-7 text-white" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
