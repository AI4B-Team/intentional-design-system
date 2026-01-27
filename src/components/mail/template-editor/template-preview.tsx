import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Expand, RotateCcw } from "lucide-react";
import { SAMPLE_DATA_SETS, replaceMergeFields } from "@/lib/default-templates";
import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  type: string;
  frontHtml: string;
  backHtml: string | null;
  className?: string;
}

const TYPE_DIMENSIONS: Record<string, { width: number; height: number; label: string; ratio: string }> = {
  postcard_4x6: { width: 6, height: 4, label: '4" × 6"', ratio: "3/2" },
  postcard_6x9: { width: 9, height: 6, label: '6" × 9"', ratio: "3/2" },
  postcard_6x11: { width: 11, height: 6, label: '6" × 11"', ratio: "11/6" },
  letter: { width: 8.5, height: 11, label: '8.5" × 11"', ratio: "17/22" },
  yellow_letter: { width: 8.5, height: 11, label: '8.5" × 11"', ratio: "17/22" },
};

export function TemplatePreview({ type, frontHtml, backHtml, className }: TemplatePreviewProps) {
  const [sampleDataId, setSampleDataId] = React.useState("sample-1");
  const [previewSide, setPreviewSide] = React.useState<"front" | "back">("front");
  
  const isLetter = type === "letter" || type === "yellow_letter";
  const dimensions = TYPE_DIMENSIONS[type] || TYPE_DIMENSIONS.postcard_6x9;
  const sampleData = SAMPLE_DATA_SETS.find(s => s.id === sampleDataId)?.data || SAMPLE_DATA_SETS[0].data;

  const renderedFront = replaceMergeFields(frontHtml, sampleData);
  const renderedBack = backHtml ? replaceMergeFields(backHtml, sampleData) : null;

  const currentContent = previewSide === "front" ? renderedFront : renderedBack;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-body">Preview</CardTitle>
          <span className="text-tiny text-content-tertiary">{dimensions.label}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Select value={sampleDataId} onValueChange={setSampleDataId}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_DATA_SETS.map((sample) => (
                <SelectItem key={sample.id} value={sample.id}>
                  {sample.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!isLetter && (
            <Tabs value={previewSide} onValueChange={(v) => setPreviewSide(v as "front" | "back")}>
              <TabsList className="h-8">
                <TabsTrigger value="front" className="text-xs px-3 h-6">Front</TabsTrigger>
                <TabsTrigger value="back" className="text-xs px-3 h-6">Back</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          <div className="flex-1" />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Expand className="h-4 w-4 mr-1" />
                Full Size
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Full Size Preview ({dimensions.label})</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {!isLetter && (
                  <Tabs value={previewSide} onValueChange={(v) => setPreviewSide(v as "front" | "back")} className="mb-4">
                    <TabsList>
                      <TabsTrigger value="front">Front</TabsTrigger>
                      <TabsTrigger value="back">Back</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
                <div 
                  className="border-2 border-dashed border-content-tertiary/30 rounded-lg overflow-hidden bg-white"
                  style={{ aspectRatio: dimensions.ratio }}
                >
                  <div 
                    className="w-full h-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: currentContent || "" }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        {/* Preview Canvas */}
        <div className="relative">
        {/* Safe Zone Indicator */}
          <div className="absolute inset-2 border border-dashed border-warning/50 rounded pointer-events-none z-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-warning/20 text-warning-foreground text-[10px] px-1.5 py-0.5 rounded z-10">
            Safe Zone
          </div>
          
          {/* Preview Content */}
          <div 
            className={cn(
              "border rounded-lg overflow-hidden bg-white shadow-sm",
              type === "yellow_letter" && "bg-[#FFF9C4]"
            )}
            style={{ aspectRatio: dimensions.ratio }}
          >
            <div 
              className="w-full h-full overflow-auto text-[10px] leading-normal"
              style={{ transform: "scale(0.9)", transformOrigin: "top left", width: "111%", height: "111%" }}
              dangerouslySetInnerHTML={{ __html: currentContent || '<p style="color: #9ca3af; text-align: center; padding: 20px;">No content yet</p>' }}
            />
          </div>
        </div>
        
        {/* Dimension Rulers (simplified) */}
        <div className="flex justify-between mt-2 text-tiny text-content-tertiary">
          <span>← {dimensions.width}" →</span>
          <span>↕ {dimensions.height}"</span>
        </div>
      </CardContent>
    </Card>
  );
}
