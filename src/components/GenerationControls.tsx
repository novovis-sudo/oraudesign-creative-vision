import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2 } from "lucide-react";
import portraitLora from "@/assets/lora-portrait.jpg";
import cinematicLora from "@/assets/lora-cinematic.jpg";
import animeLora from "@/assets/lora-anime.jpg";

interface GenerationControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange: (value: string) => void;
  selectedLora?: string;
  onLoraChange: (value: string) => void;
}

const MODELS = [
  { id: "flux-dev", name: "FLUX Dev", description: "High quality, slower generation" },
  { id: "flux-schnell", name: "FLUX Schnell", description: "Fast generation, good quality" },
  { id: "sdxl-turbo", name: "SDXL Turbo", description: "Ultra-fast generation" },
];

const LORAS = [
  { id: "none", name: "No LoRA", preview: null },
  { id: "portrait", name: "Portrait Style", preview: portraitLora },
  { id: "cinematic", name: "Cinematic", preview: cinematicLora },
  { id: "anime", name: "Anime Style", preview: animeLora },
];

export const GenerationControls = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  selectedModel,
  onModelChange,
  selectedLora = "none",
  onLoraChange,
}: GenerationControlsProps) => {
  return (
    <Card className="space-y-6 p-6 shadow-medium">
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-base font-semibold text-foreground">
          Describe your vision
        </Label>
        <Textarea
          id="prompt"
          placeholder="A professional portrait of a person in a modern office, natural lighting, confident expression..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-24 resize-none text-base"
        />
        <p className="text-xs text-muted-foreground">
          ✨ Tip: Always include a person in your prompt for best results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Base Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">LoRA Style</Label>
          <Select value={selectedLora} onValueChange={onLoraChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LORAS.map((lora) => (
                <SelectItem key={lora.id} value={lora.id}>
                  <div className="flex items-center gap-2">
                    {lora.preview && (
                      <img 
                        src={lora.preview} 
                        alt={lora.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span className="font-medium">{lora.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full gap-2"
        variant="gradient"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Wand2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Image
          </>
        )}
      </Button>
    </Card>
  );
};