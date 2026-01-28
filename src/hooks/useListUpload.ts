import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { toast } from 'sonner';

interface ColumnMapping {
  [csvColumn: string]: string; // maps csv column to our field name
}

export interface UploadStats {
  totalRecords: number;
  uniqueRecords: number;
  skippedDuplicates: number;
  skippedSuppressed: number;
  invalidRecords: number;
}

export interface UploadResult {
  success: boolean;
  listId?: string;
  stats?: UploadStats;
  error?: Error;
}

// Field options for mapping
export const LIST_FIELD_OPTIONS = [
  { value: '', label: 'Skip this column' },
  { value: 'address', label: 'Property Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip', label: 'ZIP Code' },
  { value: 'county', label: 'County' },
  { value: 'owner_name', label: 'Owner Name (Full)' },
  { value: 'owner_first_name', label: 'Owner First Name' },
  { value: 'owner_last_name', label: 'Owner Last Name' },
  { value: 'mailing_address', label: 'Mailing Address' },
  { value: 'mailing_city', label: 'Mailing City' },
  { value: 'mailing_state', label: 'Mailing State' },
  { value: 'mailing_zip', label: 'Mailing ZIP' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'estimated_value', label: 'Estimated Value' },
  { value: 'assessed_value', label: 'Assessed Value' },
  { value: 'beds', label: 'Bedrooms' },
  { value: 'baths', label: 'Bathrooms' },
  { value: 'sqft', label: 'Square Feet' },
  { value: 'lot_size', label: 'Lot Size' },
  { value: 'year_built', label: 'Year Built' },
  { value: 'property_type', label: 'Property Type' },
  { value: 'owner_type', label: 'Owner Type' },
  { value: 'last_sale_date', label: 'Last Sale Date' },
  { value: 'last_sale_price', label: 'Last Sale Price' },
  { value: 'mortgage_balance', label: 'Mortgage Balance' },
  { value: 'equity_percent', label: 'Equity Percent' },
];

export function useListUpload() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (
    file: File,
    listName: string,
    columnMapping: ColumnMapping,
    description?: string
  ): Promise<UploadResult> => {
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    setUploading(true);
    setProgress(10);
    
    try {
      // Filter out empty mappings
      const filteredMapping: ColumnMapping = {};
      for (const [key, value] of Object.entries(columnMapping)) {
        if (value && value !== '') {
          filteredMapping[key] = value;
        }
      }

      // Verify address column is mapped
      const hasAddress = Object.values(filteredMapping).includes('address');
      if (!hasAddress) {
        throw new Error('You must map at least one column to "Property Address"');
      }

      setProgress(20);

      // Create list record first
      const { data: list, error: listError } = await supabase
        .from('lists')
        .insert({
          name: listName,
          description: description || null,
          list_type: 'uploaded',
          status: 'building',
          source_file_name: file.name,
          column_mapping: filteredMapping,
          user_id: user.id,
          organization_id: organizationId
        })
        .select()
        .single();

      if (listError) throw listError;

      setProgress(40);

      // Upload file to storage
      const fileName = `${user.id}/${list.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('list-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setProgress(60);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('list-uploads')
        .getPublicUrl(fileName);

      // Update list with file URL
      await supabase
        .from('lists')
        .update({ source_file_url: publicUrl })
        .eq('id', list.id);

      setUploading(false);
      setProcessing(true);
      setProgress(70);

      // Call edge function to process
      const { data, error } = await supabase.functions.invoke('process-list-upload', {
        body: {
          listId: list.id,
          fileUrl: publicUrl,
          columnMapping: filteredMapping,
          organizationId
        }
      });

      setProgress(100);

      if (error) throw error;

      toast.success(`List imported! ${data.stats.uniqueRecords} records added.`);
      
      return {
        success: true,
        listId: list.id,
        stats: data.stats
      };

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      return { success: false, error };
    } finally {
      setUploading(false);
      setProcessing(false);
      setProgress(0);
    }
  }, [user, organizationId]);

  const parseCSVHeaders = useCallback(async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split(/\r?\n/)[0];
        // Handle quoted CSV headers
        const headers: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < firstLine.length; i++) {
          const char = firstLine[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            headers.push(current.trim().replace(/"/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        headers.push(current.trim().replace(/"/g, ''));
        resolve(headers);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  const previewCSV = useCallback(async (file: File, limit = 5): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        
        // Parse headers
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim().replace(/"/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/"/g, ''));
          return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        
        const rows: Record<string, string>[] = [];
        for (let i = 1; i <= Math.min(limit, lines.length - 1); i++) {
          if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => {
              row[h] = values[idx] || '';
            });
            rows.push(row);
          }
        }
        resolve(rows);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  const countCSVRows = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        // Subtract 1 for header row
        resolve(Math.max(0, lines.length - 1));
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  // Auto-detect column mappings based on header names
  const autoDetectMappings = useCallback((headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    
    const patterns: Record<string, RegExp[]> = {
      address: [/^address$/i, /property.*address/i, /street.*address/i, /^street$/i, /^property$/i],
      city: [/^city$/i, /property.*city/i],
      state: [/^state$/i, /property.*state/i, /^st$/i],
      zip: [/^zip$/i, /postal/i, /property.*zip/i, /^zip.*code$/i],
      county: [/^county$/i],
      owner_name: [/^owner$/i, /owner.*name$/i, /^name$/i],
      owner_first_name: [/first.*name/i, /owner.*first/i],
      owner_last_name: [/last.*name/i, /owner.*last/i],
      mailing_address: [/mail.*address/i, /mailing/i],
      mailing_city: [/mail.*city/i],
      mailing_state: [/mail.*state/i],
      mailing_zip: [/mail.*zip/i],
      phone: [/phone/i, /tel/i, /mobile/i],
      email: [/email/i, /e-mail/i],
      estimated_value: [/estimated.*value/i, /market.*value/i, /^value$/i],
      assessed_value: [/assessed/i, /tax.*value/i],
      beds: [/bed/i, /bedroom/i],
      baths: [/bath/i, /bathroom/i],
      sqft: [/sqft/i, /sq.*ft/i, /square.*feet/i, /living.*area/i],
      lot_size: [/lot.*size/i, /land.*size/i],
      year_built: [/year.*built/i, /built/i, /age/i],
      property_type: [/property.*type/i, /^type$/i],
      owner_type: [/owner.*type/i],
      last_sale_date: [/sale.*date/i, /sold.*date/i],
      last_sale_price: [/sale.*price/i, /sold.*price/i],
      mortgage_balance: [/mortgage/i, /loan.*balance/i],
      equity_percent: [/equity/i],
    };
    
    for (const header of headers) {
      for (const [field, regexps] of Object.entries(patterns)) {
        for (const regex of regexps) {
          if (regex.test(header)) {
            // Don't override if already mapped
            if (!Object.values(mapping).includes(field)) {
              mapping[header] = field;
            }
            break;
          }
        }
      }
    }
    
    return mapping;
  }, []);

  return {
    uploadFile,
    parseCSVHeaders,
    previewCSV,
    countCSVRows,
    autoDetectMappings,
    uploading,
    processing,
    progress,
    isLoading: uploading || processing
  };
}
