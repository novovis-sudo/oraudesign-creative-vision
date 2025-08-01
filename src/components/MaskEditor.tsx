import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Brush, Eraser, RotateCcw, Save, X, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MaskEditorProps {
  imageUrl: string;
  onSave: (maskData: string) => void;
  onCancel: () => void;
}

export const MaskEditor = ({ imageUrl, onSave, onCancel }: MaskEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setCtx(context);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the base image
      context.drawImage(img, 0, 0, width, height);
      
      // Create overlay for mask
      context.globalCompositeOperation = 'source-over';
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getMousePos = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  const startDrawing = useCallback((e: MouseEvent) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [ctx, getMousePos]);

  const draw = useCallback((e: MouseEvent) => {
    if (!isDrawing || !ctx) return;
    
    const pos = getMousePos(e);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Red overlay for mask area
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [isDrawing, ctx, brushSize, tool, getMousePos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const clearMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;

    // Reload the original image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  }, [ctx, imageUrl]);

  const saveMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas for the mask only
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    // Copy the canvas content
    maskCtx.drawImage(canvas, 0, 0);

    // Convert to black and white mask
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        // Masked area - make it white
        data[i] = 255;     // Red
        data[i + 1] = 255; // Green
        data[i + 2] = 255; // Blue
        data[i + 3] = 255; // Alpha
      } else {
        // Unmasked area - make it black
        data[i] = 0;       // Red
        data[i + 1] = 0;   // Green
        data[i + 2] = 0;   // Blue
        data[i + 3] = 255; // Alpha
      }
    }

    maskCtx.putImageData(imageData, 0, 0);
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onSave(maskDataUrl);
  }, [onSave]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 shadow-large border-editor-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-editor-text">Mask Editor</h2>
              <p className="text-sm text-editor-muted">Paint the areas you want to edit</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveMask} size="sm" className="bg-editor-primary text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Mask
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="border border-editor-border rounded-lg overflow-hidden bg-white shadow-medium">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto cursor-crosshair"
                  style={{ display: 'block' }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-editor-text">Tools</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tool === 'brush' ? 'default' : 'outline'}
                    onClick={() => setTool('brush')}
                    className="h-12"
                  >
                    <Brush className="w-4 h-4 mr-2" />
                    Brush
                  </Button>
                  <Button
                    variant={tool === 'eraser' ? 'default' : 'outline'}
                    onClick={() => setTool('eraser')}
                    className="h-12"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Eraser
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-editor-text">
                  Brush Size: {brushSize}px
                </Label>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <Button
                variant="outline"
                onClick={clearMask}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Mask
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Tips:</h3>
                <ul className="text-xs text-editor-muted space-y-1">
                  <li>• Paint red areas to mark for editing</li>
                  <li>• Use eraser to remove mask areas</li>
                  <li>• Larger brush for quick coverage</li>
                  <li>• Smaller brush for precise details</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};