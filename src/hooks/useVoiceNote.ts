import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VoiceNoteResult {
  blob: Blob;
  duration: number;
  url: string;
}

export function useVoiceNote() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Check for microphone support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Microphone not supported on this device');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Determine best available mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      setAudioUrl(null);
      
      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
      
      return true;
    } catch (error) {
      console.error('Microphone access error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error('Could not access microphone');
      }
      return false;
    }
  }, []);

  const stopRecording = useCallback((): Promise<VoiceNoteResult | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }
      
      const currentDuration = duration;
      
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        resolve({
          blob,
          duration: currentDuration,
          url
        });
      };
      
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    });
  }, [duration]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    chunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
    setAudioUrl(null);
  }, []);

  const uploadVoiceNote = useCallback(async (
    blob: Blob, 
    propertyId: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to upload');
      return null;
    }

    try {
      const extension = blob.type.includes('webm') ? 'webm' : 'mp4';
      const fileName = `${user.id}/${propertyId}-${Date.now()}.${extension}`;
      
      const { error } = await supabase.storage
        .from('d4d-photos')
        .upload(`voice-notes/${fileName}`, blob, {
          contentType: blob.type,
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload voice note');
        return null;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('d4d-photos')
        .getPublicUrl(`voice-notes/${fileName}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload voice note');
      return null;
    }
  }, [user]);

  const transcribeVoiceNote = useCallback(async (audioUrl: string): Promise<string | null> => {
    setIsTranscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioUrl }
      });
      
      if (error) {
        console.error('Transcription error:', error);
        return null;
      }
      
      return data?.transcript || null;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cancelRecording();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [cancelRecording, audioUrl]);

  return {
    isRecording,
    duration,
    audioUrl,
    isTranscribing,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadVoiceNote,
    transcribeVoiceNote,
    cleanup
  };
}
