import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Type, Eraser, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignatureCaptureResult {
  dataUrl: string;
  method: "draw" | "type";
  timestamp: Date;
}

interface SignaturePadProps {
  onComplete: (result: SignatureCaptureResult) => void;
  signerName?: string;
  className?: string;
}

export function SignaturePad({ onComplete, signerName = "", className }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const [typedName, setTypedName] = React.useState(signerName);
  const [selectedFont, setSelectedFont] = React.useState<string>("cursive");
  const [mode, setMode] = React.useState<"draw" | "type">("draw");

  const fonts = [
    { id: "cursive", label: "Script", style: "'Brush Script MT', 'Segoe Script', cursive" },
    { id: "serif", label: "Formal", style: "'Georgia', 'Times New Roman', serif" },
    { id: "handwriting", label: "Hand", style: "'Comic Sans MS', 'Marker Felt', cursive" },
  ];

  // ─── Canvas drawing ──────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // ─── Generate typed signature as canvas ───────────────────
  const renderTypedSignature = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fontDef = fonts.find((f) => f.id === selectedFont);
    ctx.font = `italic 42px ${fontDef?.style || "cursive"}`;
    ctx.fillStyle = "#1a1a1a";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 20, 60);
    return canvas.toDataURL("image/png");
  };

  const handleComplete = () => {
    let dataUrl = "";
    if (mode === "draw") {
      dataUrl = canvasRef.current?.toDataURL("image/png") || "";
    } else {
      dataUrl = renderTypedSignature();
    }
    onComplete({ dataUrl, method: mode, timestamp: new Date() });
  };

  const isValid = mode === "draw" ? hasDrawn : typedName.trim().length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw" className="gap-2">
            <PenTool className="h-4 w-4" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="gap-2">
            <Type className="h-4 w-4" /> Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={120}
              className="w-full border-2 border-dashed border-border-subtle rounded-lg bg-white cursor-crosshair touch-none"
              style={{ height: 120 }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-muted-foreground/50">
                Draw your signature here
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 border-t border-muted-foreground/20" />
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={clearCanvas} disabled={!hasDrawn}>
              <Eraser className="h-3 w-3" /> Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-4 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Your full name</Label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Smith"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <div className="flex gap-2">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-lg border-2 text-center transition-colors text-lg",
                    selectedFont === font.id
                      ? "border-brand bg-brand/5"
                      : "border-border-subtle hover:border-muted-foreground/30"
                  )}
                  style={{ fontFamily: font.style, fontStyle: "italic" }}
                  onClick={() => setSelectedFont(font.id)}
                >
                  {typedName || "Preview"}
                </button>
              ))}
            </div>
          </div>

          {typedName && (
            <Card padding="md" className="text-center bg-white">
              <p
                className="text-3xl text-foreground"
                style={{
                  fontFamily: fonts.find((f) => f.id === selectedFont)?.style,
                  fontStyle: "italic",
                }}
              >
                {typedName}
              </p>
              <div className="mt-2 border-t border-muted-foreground/20 w-3/4 mx-auto" />
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Button onClick={handleComplete} disabled={!isValid} className="w-full gap-2">
        <Check className="h-4 w-4" />
        Apply Signature
      </Button>
    </div>
  );
}
