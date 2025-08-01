import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Wand2, Eye, Loader2, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EditingControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  selectedModel: string;
  onModelChange: (value: string) => void;
  selectedControlNet: string;
  onControlNetChange: (value: string) => void;
  denoisingStrength: number;
  onDenoisingStrengthChange: (value: number) => void;
  guidanceScale: number;
  onGuidanceScaleChange: (value: number) => void;
  seed: number;
  onSeedChange: (value: number) => void;
  onGenerate: () => void;
  onGenerateDescription: () => void;
  isGenerating: boolean;
  hasImage: boolean;
}

interface BaseModel {
  id: string;
  name: string;
  description: string;
  model_path: string;
  is_default: boolean;
}

interface ControlNetModule {
  id: string;
  name: string;
  description: string;
  model_path: string;
}

export const EditingControls = ({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  selectedModel,
  onModelChange,
  selectedControlNet,
  onControlNetChange,
  denoisingStrength,
  onDenoisingStrengthChange,
  guidanceScale,
  onGuidanceScaleChange,
  seed,
  onSeedChange,
  onGenerate,
  onGenerateDescription,
  isGenerating,
  hasImage,
}: EditingControlsProps) => {
  const [models, setModels] = useState<BaseModel[]>([]);
  const [controlNets, setControlNets] = useState<ControlNetModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for now until types are updated
        const mockModels = [
          { id: '1', name: 'Realistic Vision v5.1', description: 'High-quality photorealistic model', model_path: '', is_default: true },
          { id: '2', name: 'DreamShaper v8', description: 'Versatile photorealism', model_path: '', is_default: false }
        ];
        
        const mockControlNets = [
          { id: '1', name: 'openpose', description: 'Human pose detection', model_path: '' },
          { id: '2', name: 'canny', description: 'Edge detection', model_path: '' }
        ];

        setModels(mockModels);
        setControlNets(mockControlNets);
        
        if (!selectedModel && mockModels.length > 0) {
          onModelChange(mockModels[0].name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedModel, onModelChange]);

  const handleRandomSeed = () => {
    onSeedChange(Math.floor(Math.random() * 1000000));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-sm font-semibold text-editor-text">
            Prompt Description
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateDescription}
            disabled={!hasImage}
            className="text-xs border-editor-border"
          >
            <Eye className="w-3 h-3 mr-1" />
            Describe Image
          </Button>
        </div>
        <Textarea
          id="prompt"
          placeholder="Describe the entire scene with your desired changes, e.g., 'a professional woman in a green business suit standing in a modern office, natural lighting'"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[100px] resize-none border-editor-border focus:border-editor-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="negative-prompt" className="text-sm font-semibold text-editor-text">
          Negative Prompt (Optional)
        </Label>
        <Textarea
          id="negative-prompt"
          placeholder="What to avoid: blurry, low quality, distorted, cartoon, anime..."
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          className="min-h-[80px] resize-none border-editor-border focus:border-editor-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-editor-text">Base Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="border-editor-border">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-card border-editor-border">
              {models.map((model) => (
                <SelectItem key={model.id} value={model.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-editor-muted">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-editor-text">ControlNet Module</Label>
          <Select value={selectedControlNet} onValueChange={onControlNetChange}>
            <SelectTrigger className="border-editor-border">
              <SelectValue placeholder="Select ControlNet" />
            </SelectTrigger>
            <SelectContent className="bg-card border-editor-border">
              <SelectItem value="none">None</SelectItem>
              {controlNets.map((controlNet) => (
                <SelectItem key={controlNet.id} value={controlNet.name}>
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{controlNet.name}</span>
                    <span className="text-xs text-editor-muted">{controlNet.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-editor-text">
            Denoising Strength: {denoisingStrength.toFixed(2)}
          </Label>
          <Slider
            value={[denoisingStrength]}
            onValueChange={(value) => onDenoisingStrengthChange(value[0])}
            min={0.1}
            max={1}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-editor-muted">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-editor-text">
            Guidance Scale: {guidanceScale.toFixed(1)}
          </Label>
          <Slider
            value={[guidanceScale]}
            onValueChange={(value) => onGuidanceScaleChange(value[0])}
            min={1}
            max={20}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-editor-muted">
            <span>Creative</span>
            <span>Precise</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-editor-text">Seed</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(parseInt(e.target.value) || -1)}
            placeholder="-1 for random"
            className="border-editor-border focus:border-editor-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRandomSeed}
            className="border-editor-border"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!hasImage || !prompt.trim() || !selectedModel || isGenerating}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-editor-primary to-editor-secondary text-white hover:opacity-90 transition-all duration-300"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Image
          </>
        )}
      </Button>
    </div>
  );
};