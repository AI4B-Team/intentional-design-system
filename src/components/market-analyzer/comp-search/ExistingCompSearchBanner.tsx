 import React from 'react';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { Button } from '@/components/ui/button';
 import { Clock, RefreshCw, ExternalLink } from 'lucide-react';
 import { formatTimeAgo, CompSearch } from '@/hooks/useCompSearches';
 
 interface ExistingCompSearchBannerProps {
   existingSearch: CompSearch;
   onViewExisting?: () => void;
   onRunNew?: () => void;
 }
 
 export function ExistingCompSearchBanner({ 
   existingSearch, 
   onViewExisting, 
   onRunNew 
 }: ExistingCompSearchBannerProps) {
   const timeAgo = formatTimeAgo(existingSearch.created_at);
   
   return (
     <Alert className="bg-primary/10 border-primary/30">
       <Clock className="h-4 w-4 text-primary" />
       <AlertDescription className="flex items-center justify-between gap-4">
         <div className="flex-1">
           <span className="font-medium text-foreground">
             Comps already ran for this property
           </span>
           <span className="text-muted-foreground ml-2">
             — {existingSearch.comps_found} comps found {timeAgo}
           </span>
         </div>
         <div className="flex items-center gap-2">
           {onViewExisting && (
             <Button
               variant="outline"
               size="sm"
               onClick={onViewExisting}
               className="h-7 text-xs"
             >
               <ExternalLink className="h-3 w-3 mr-1" />
               View Results
             </Button>
           )}
           {onRunNew && (
             <Button
               variant="ghost"
               size="sm"
               onClick={onRunNew}
               className="h-7 text-xs"
             >
               <RefreshCw className="h-3 w-3 mr-1" />
               Run Again
             </Button>
           )}
         </div>
       </AlertDescription>
     </Alert>
   );
 }