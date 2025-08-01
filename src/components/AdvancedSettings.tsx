import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eraser, Paintbrush, Shuffle } from "lucide-react";

interface AdvancedSettingsProps {
  settings: {
    brushSize: number;
    enableControlNet: boolean;
    seed: number;
    enableGAN: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const AdvancedSettings = ({ settings, onSettingsChange }: AdvancedSettingsProps) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const generateRandomSeed = () => {
    updateSetting('seed', Math.floor(Math.random() * 1000000));
  };

  return (
    <Card className="p-6 space-y-6 shadow-medium bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-accent rounded-full"></div>
        <h3 className="text-lg font-semibold text-foreground">Advanced Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Brush Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Inpainting Brush</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Brush Size</span>
              <span className="text-xs font-medium">{settings.brushSize}px</span>
            </div>
            <Slider
              value={[settings.brushSize]}
              onValueChange={([value]) => updateSetting('brushSize', value)}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Background Remover */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eraser className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Background Remover</Label>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Remove Background
          </Button>
        </div>

        <Separator />

        {/* ControlNet */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">ControlNet</Label>
            <p className="text-xs text-muted-foreground">Enhanced pose and structure control</p>
          </div>
          <Switch
            checked={settings.enableControlNet}
            onCheckedChange={(checked) => updateSetting('enableControlNet', checked)}
          />
        </div>

        {/* GAN Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">GAN Enhancement</Label>
            <p className="text-xs text-muted-foreground">Post-processing with GAN models</p>
          </div>
          <Switch
            checked={settings.enableGAN}
            onCheckedChange={(checked) => updateSetting('enableGAN', checked)}
          />
        </div>

        <Separator />

        {/* Seed Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Seed Control</Label>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="-1 for random"
              value={settings.seed === -1 ? "" : settings.seed}
              onChange={(e) => updateSetting('seed', e.target.value ? parseInt(e.target.value) : -1)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={generateRandomSeed}
              title="Generate random seed"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use -1 for random generation or set a specific number for reproducible results
          </p>
        </div>
      </div>
    </Card>
  );
};