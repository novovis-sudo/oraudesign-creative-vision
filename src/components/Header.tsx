import { Button } from "@/components/ui/button";
import { Settings, Sparkles } from "lucide-react";

interface HeaderProps {
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
}

export const Header = ({ onToggleAdvanced, showAdvanced }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Orau</h1>
              <p className="text-sm text-muted-foreground">AI Image Generation Studio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={showAdvanced ? "accent" : "ghost"}
              size="sm"
              onClick={onToggleAdvanced}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Advanced
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};