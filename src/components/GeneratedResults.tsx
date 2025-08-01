import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RotateCcw, Clock, Settings, Copy } from "lucide-react";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negative_prompt?: string;
  timestamp: Date;
  model: string;
  controlnet_module?: string;
  denoising_strength: number;
  guidance_scale: number;
  seed?: number;
}

interface GeneratedResultsProps {
  images: GeneratedImage[];
  onImageReuse: (image: GeneratedImage) => void;
}

export const GeneratedResults = ({ images, onImageReuse }: GeneratedResultsProps) => {
  const handleDownload = (image: GeneratedImage) => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `orau_generated_${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  if (images.length === 0) {
    return (
      <Card className="p-8 text-center shadow-medium border-editor-border">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-xl flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-editor-text">No Results Yet</h3>
            <p className="text-sm text-editor-muted">
              Upload an image and start editing to see your results here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium border-editor-border">
      <div className="p-6 border-b border-editor-border">
        <h3 className="text-lg font-semibold text-editor-text">Generated Results</h3>
        <p className="text-sm text-editor-muted">{images.length} image{images.length !== 1 ? 's' : ''} generated</p>
      </div>
      
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {images.map((image) => (
          <div key={image.id} className="group border border-editor-subtle rounded-lg overflow-hidden bg-editor-elevated">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={image.url}
                alt="Generated result"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onImageReuse(image)}
                  className="flex-1 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reuse
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(image)}
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {image.model}
                  </Badge>
                  <div className="flex items-center text-xs text-editor-muted">
                    <Clock className="w-3 h-3 mr-1" />
                    {image.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-editor-text line-clamp-2 flex-1 mr-2">
                      {image.prompt}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyPrompt(image.prompt)}
                      className="p-1 h-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {image.negative_prompt && (
                    <p className="text-xs text-red-600 line-clamp-1">
                      Neg: {image.negative_prompt}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-editor-muted">
                  <div>Strength: {image.denoising_strength.toFixed(2)}</div>
                  <div>Guidance: {image.guidance_scale.toFixed(1)}</div>
                  {image.seed && (
                    <div className="col-span-2">Seed: {image.seed}</div>
                  )}
                  {image.controlnet_module && (
                    <div className="col-span-2 capitalize">
                      ControlNet: {image.controlnet_module}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};