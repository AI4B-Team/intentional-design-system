 import React from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { 
   History, 
   MapPin, 
   Trash2, 
   ExternalLink,
   Search,
   TrendingUp
 } from 'lucide-react';
 import { useCompSearches, useDeleteCompSearch, formatTimeAgo, CompSearch } from '@/hooks/useCompSearches';
 import { cn } from '@/lib/utils';
 
 interface SavedCompSearchesProps {
   onSelectSearch?: (search: CompSearch) => void;
   className?: string;
 }
 
 export function SavedCompSearches({ onSelectSearch, className }: SavedCompSearchesProps) {
   const { data: searches, isLoading } = useCompSearches();
   const deleteSearch = useDeleteCompSearch();
 
   if (isLoading) {
     return (
       <Card className={className}>
         <CardHeader className="pb-3">
           <CardTitle className="text-base flex items-center gap-2">
             <History className="h-4 w-4" />
             Saved Comp Searches
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {[1, 2, 3].map((i) => (
               <div key={i} className="animate-pulse">
                 <div className="h-16 bg-muted rounded-lg" />
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
 
   if (!searches || searches.length === 0) {
     return (
       <Card className={className}>
         <CardHeader className="pb-3">
           <CardTitle className="text-base flex items-center gap-2">
             <History className="h-4 w-4" />
             Saved Comp Searches
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="text-center py-8 text-muted-foreground">
             <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
             <p className="text-sm">No saved comp searches yet</p>
             <p className="text-xs mt-1">Run a comp search to save it here</p>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className={className}>
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-base flex items-center gap-2">
             <History className="h-4 w-4" />
             Saved Comp Searches
           </CardTitle>
           <Badge variant="secondary" className="text-xs">
             {searches.length} saved
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="p-0">
         <ScrollArea className="h-[320px]">
           <div className="space-y-1 p-4 pt-0">
             {searches.map((search) => (
               <div
                 key={search.id}
                 className={cn(
                   "group p-3 rounded-lg border border-border-subtle",
                   "hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                 )}
                 onClick={() => onSelectSearch?.(search)}
               >
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                       <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                       <span className="font-medium text-sm truncate">
                         {search.subject_address}
                       </span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       {search.subject_city && (
                         <span>{search.subject_city}, {search.subject_state}</span>
                       )}
                       {search.subject_zip && (
                         <span className="text-muted-foreground/60">{search.subject_zip}</span>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center gap-1">
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                       onClick={(e) => {
                         e.stopPropagation();
                         deleteSearch.mutate(search.id);
                       }}
                     >
                       <Trash2 className="h-3.5 w-3.5 text-destructive" />
                     </Button>
                   </div>
                 </div>
 
                 <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border-subtle">
                   <div className="flex items-center gap-1 text-xs">
                     <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                       {search.comps_found} comps
                     </Badge>
                   </div>
                   {search.avg_price_per_sqft && (
                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
                       <TrendingUp className="h-3 w-3" />
                       ${Math.round(search.avg_price_per_sqft)}/sqft
                     </div>
                   )}
                   <div className="flex-1" />
                   <span className="text-[10px] text-muted-foreground">
                     {formatTimeAgo(search.created_at)}
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </ScrollArea>
       </CardContent>
     </Card>
   );
 }