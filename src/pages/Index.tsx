import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { GenerationControls } from "@/components/GenerationControls";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { ResultsGallery } from "@/components/ResultsGallery";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  model: string;
  liked?: boolean;
}

const Index = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("flux-schnell");
  const [selectedLora, setSelectedLora] = useState("none");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const [advancedSettings, setAdvancedSettings] = useState({
    brushSize: 20,
    enableControlNet: false,
    seed: -1,
    enableGAN: false,
  });

  const handleImageSelect = useCallback((file: File | string) => {
    if (typeof file === 'string') {
      setCurrentImage(file);
    } else {
      const url = URL.createObjectURL(file);
      setCurrentImage(url);
    }
    toast.success("Image loaded successfully!");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!currentImage || !prompt.trim()) {
      toast.error("Please upload an image and enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: currentImage, // In a real app, this would be the generated image
        prompt,
        timestamp: new Date(),
        model: selectedModel,
        liked: false,
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      toast.success("Image generated successfully!");
    } catch (error) {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [currentImage, prompt, selectedModel]);

  const handleToggleLike = useCallback((id: string) => {
    setGeneratedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, liked: !img.liked } : img
      )
    );
  }, []);

  const handleDownload = useCallback((image: GeneratedImage) => {
    toast.success("Download started!");
  }, []);

  const handleShare = useCallback((image: GeneratedImage) => {
    toast.success("Share link copied to clipboard!");
  }, []);

  const handleImageSelect2 = useCallback((image: GeneratedImage) => {
    setCurrentImage(image.url);
    setPrompt(image.prompt);
    toast.success("Image loaded for editing!");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        showAdvanced={showAdvanced}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Image Upload & Controls */}
          <div className="xl:col-span-2 space-y-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={currentImage}
              onRemoveImage={() => setCurrentImage("")}
            />
            
            <GenerationControls
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              selectedLora={selectedLora}
              onLoraChange={setSelectedLora}
            />
          </div>
          
          {/* Right Column - Advanced Settings & Results */}
          <div className="space-y-6">
            {showAdvanced && (
              <AdvancedSettings
                settings={advancedSettings}
                onSettingsChange={setAdvancedSettings}
              />
            )}
            
            <ResultsGallery
              images={generatedImages}
              onImageSelect={handleImageSelect2}
              onToggleLike={handleToggleLike}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
