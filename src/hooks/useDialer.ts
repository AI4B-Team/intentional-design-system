import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';

interface CallRecord {
  id: string;
  twilioSid?: string;
  phone_number: string;
  contact_name?: string;
  status: string;
  queue_contact_id?: string;
  queue_id?: string;
  property_id?: string;
}

interface QueueContact {
  id: string;
  contact_name?: string;
  phone_number: string;
  property_address?: string;
  property_id?: string;
  queue_id: string;
}

interface DialerState {
  isReady: boolean;
  isConfigured: boolean;
  isOnCall: boolean;
  currentCall: CallRecord | null;
  callStatus: 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed';
  callDuration: number;
  currentContact: QueueContact | null;
}

export function useDialer() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const [state, setState] = useState<DialerState>({
    isReady: false,
    isConfigured: false,
    isOnCall: false,
    currentCall: null,
    callStatus: 'idle',
    callDuration: 0,
    currentContact: null
  });
  
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize dialer - check if Twilio is configured
  const initialize = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('twilio-token');
      
      if (error) {
        console.error('Twilio token error:', error);
        setState(prev => ({ ...prev, isReady: true, isConfigured: false }));
        return;
      }
      
      if (data?.code === 'TWILIO_NOT_CONFIGURED') {
        setState(prev => ({ ...prev, isReady: true, isConfigured: false }));
        toast.info('Dialer ready (demo mode - Twilio not configured)');
        return;
      }

      setState(prev => ({ ...prev, isReady: true, isConfigured: true }));
      toast.success('Dialer ready');
    } catch (error) {
      console.error('Dialer init error:', error);
      setState(prev => ({ ...prev, isReady: true, isConfigured: false }));
    }
  }, []);

  // Make a call
  const makeCall = useCallback(async (params: {
    phoneNumber: string;
    contactName?: string;
    queueId?: string;
    queueContactId?: string;
    propertyId?: string;
  }) => {
    if (!state.isReady) {
      toast.error('Dialer not ready');
      return null;
    }

    setState(prev => ({ ...prev, callStatus: 'connecting' }));

    try {
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: {
          toNumber: params.phoneNumber,
          contactName: params.contactName,
          queueId: params.queueId,
          queueContactId: params.queueContactId,
          propertyId: params.propertyId,
          organizationId
        }
      });

      if (error) throw error;

      if (data?.code === 'TWILIO_NOT_CONFIGURED') {
        toast.error('Twilio is not configured. Add API keys to enable calling.');
        setState(prev => ({ ...prev, callStatus: 'idle' }));
        return null;
      }

      if (data?.code === 'DNC_BLOCKED') {
        toast.error('Cannot call - number is on Do Not Call list');
        setState(prev => ({ ...prev, callStatus: 'idle' }));
        return null;
      }

      setState(prev => ({
        ...prev,
        isOnCall: true,
        currentCall: {
          id: data.callId,
          twilioSid: data.twilioSid,
          phone_number: params.phoneNumber,
          contact_name: params.contactName,
          status: 'ringing',
          queue_contact_id: params.queueContactId,
          queue_id: params.queueId,
          property_id: params.propertyId
        },
        callStatus: 'ringing'
      }));

      // Start monitoring call status
      pollCallStatus(data.callId);

      return data;

    } catch (error: any) {
      console.error('Make call error:', error);
      toast.error(error.message || 'Failed to make call');
      setState(prev => ({ ...prev, callStatus: 'idle' }));
      return null;
    }
  }, [state.isReady, organizationId]);

  // Poll call status
  const pollCallStatus = useCallback((callId: string) => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('id', callId)
          .single();

        if (error || !data) {
          console.error('Error polling call status:', error);
          return;
        }

        const newStatus = data.status as DialerState['callStatus'];
        
        setState(prev => ({
          ...prev,
          callStatus: newStatus,
          currentCall: prev.currentCall ? {
            ...prev.currentCall,
            status: newStatus
          } : null
        }));

        // Start duration timer when call is answered
        if (newStatus === 'in-progress' && !callStartTimeRef.current) {
          callStartTimeRef.current = new Date();
          startDurationTimer();
        }

        // Stop polling when call ends
        if (['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(newStatus)) {
          stopDurationTimer();
          return;
        }

        // Continue polling
        pollingRef.current = setTimeout(checkStatus, 1000);
      } catch (error) {
        console.error('Poll error:', error);
      }
    };

    checkStatus();
  }, []);

  // Duration timer
  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) return;
    
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor(
          (Date.now() - callStartTimeRef.current.getTime()) / 1000
        );
        setState(prev => ({ ...prev, callDuration: duration }));
      }
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    callStartTimeRef.current = null;
  }, []);

  // End call
  const endCall = useCallback(async () => {
    if (!state.currentCall?.twilioSid) {
      // If no Twilio SID, just reset state
      stopDurationTimer();
      setState(prev => ({
        ...prev,
        isOnCall: false,
        callStatus: 'completed'
      }));
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('end-call', {
        body: { callSid: state.currentCall.twilioSid }
      });

      if (error) throw error;

      stopDurationTimer();
      setState(prev => ({
        ...prev,
        isOnCall: false,
        callStatus: 'completed'
      }));

    } catch (error) {
      console.error('End call error:', error);
      toast.error('Failed to end call');
    }
  }, [state.currentCall, stopDurationTimer]);

  // Set disposition
  const setDisposition = useCallback(async (
    dispositionId: string,
    notes?: string,
    followUpDate?: string
  ) => {
    if (!state.currentCall?.id) return;

    try {
      // Get disposition details
      const { data: disposition, error: dispError } = await supabase
        .from('call_dispositions')
        .select('*')
        .eq('id', dispositionId)
        .single();

      if (dispError || !disposition) {
        toast.error('Disposition not found');
        return;
      }

      // Update call record
      await supabase
        .from('calls')
        .update({
          disposition: disposition.name,
          disposition_category: disposition.category,
          notes,
          follow_up_date: followUpDate
        })
        .eq('id', state.currentCall.id);

      // Update queue contact if applicable
      if (state.currentCall.queue_contact_id) {
        const updates: Record<string, any> = {
          last_disposition: disposition.name,
          updated_at: new Date().toISOString()
        };

        if (disposition.removes_from_queue) {
          updates.status = 'completed';
          updates.outcome = disposition.name;
          updates.outcome_notes = notes;
        }

        if (disposition.schedules_followup && disposition.default_followup_days) {
          const followUp = new Date();
          followUp.setDate(followUp.getDate() + disposition.default_followup_days);
          updates.next_attempt_after = followUp.toISOString();
        }

        await supabase
          .from('call_queue_contacts')
          .update(updates)
          .eq('id', state.currentCall.queue_contact_id);

        // Update queue stats
        if (state.currentCall.queue_id) {
          await supabase.rpc('update_queue_stats', { 
            p_queue_id: state.currentCall.queue_id 
          });
        }
      }

      // Add to DNC if specified
      if (disposition.adds_to_dnc && state.currentCall.phone_number && organizationId && user) {
        // Use phone number as normalized_address for DNC entries
        const phone = state.currentCall.phone_number.replace(/\D/g, '');
        await supabase.from('suppression_list').insert({
          user_id: user.id,
          organization_id: organizationId,
          normalized_address: `phone:${phone}`,
          address_hash: `phone_${phone}`,
          reason: 'do_not_call',
          source: 'call_disposition'
        });
      }

      toast.success(`Marked as: ${disposition.name}`);

      // Reset for next call
      setState(prev => ({
        ...prev,
        isOnCall: false,
        currentCall: null,
        callStatus: 'idle',
        callDuration: 0,
        currentContact: null
      }));

    } catch (error) {
      console.error('Set disposition error:', error);
      toast.error('Failed to save disposition');
    }
  }, [state.currentCall, organizationId]);

  // Get next contact from queue
  const getNextContact = useCallback(async (queueId: string): Promise<QueueContact | null> => {
    if (!user) return null;

    try {
      const { data: contactId, error: rpcError } = await supabase
        .rpc('get_next_queue_contact', {
          p_queue_id: queueId,
          p_user_id: user.id
        });

      if (rpcError || !contactId) {
        return null;
      }

      const { data: contact, error: fetchError } = await supabase
        .from('call_queue_contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (fetchError || !contact) return null;

      const queueContact: QueueContact = {
        id: contact.id,
        contact_name: contact.contact_name ?? undefined,
        phone_number: contact.phone_number,
        property_address: contact.property_address ?? undefined,
        property_id: contact.property_id ?? undefined,
        queue_id: contact.queue_id
      };

      setState(prev => ({ ...prev, currentContact: queueContact }));
      return queueContact;

    } catch (error) {
      console.error('Get next contact error:', error);
      return null;
    }
  }, [user]);

  // Skip current contact
  const skipContact = useCallback(async () => {
    if (!state.currentContact) return;

    await supabase
      .from('call_queue_contacts')
      .update({ 
        status: 'skipped',
        updated_at: new Date().toISOString()
      })
      .eq('id', state.currentContact.id);

    setState(prev => ({ ...prev, currentContact: null }));
    toast.info('Contact skipped');
  }, [state.currentContact]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopDurationTimer();
    };
  }, [stopDurationTimer]);

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    formattedDuration: formatDuration(state.callDuration),
    initialize,
    makeCall,
    endCall,
    setDisposition,
    getNextContact,
    skipContact,
    setCurrentContact: (contact: QueueContact | null) => 
      setState(prev => ({ ...prev, currentContact: contact }))
  };
}
