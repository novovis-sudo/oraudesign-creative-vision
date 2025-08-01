import { useState, useCallback, useRef } from "react";
import { ImageUpload } from "./ImageUpload";
import { EditingControls } from "./EditingControls";
import { MaskEditor } from "./MaskEditor";
import { GeneratedResults } from "./GeneratedResults";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export const PhotoEditor = () => {
  const [currentImage, setCurrentImage] = useState<string>("");
  const [maskData, setMaskData] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedControlNet, setSelectedControlNet] = useState("none");
  const [denoisingStrength, setDenoisingStrength] = useState(0.7);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showMaskEditor, setShowMaskEditor] = useState(false);

  const handleImageSelect = useCallback((file: File | string) => {
    if (typeof file === 'string') {
      setCurrentImage(file);
    } else {
      const url = URL.createObjectURL(file);
      setCurrentImage(url);
    }
    setMaskData(""); // Reset mask when new image is selected
    setShowMaskEditor(false);
    toast.success("Image loaded - ready for editing!");
  }, []);

  const handleMaskSave = useCallback((maskImageData: string) => {
    setMaskData(maskImageData);
    setShowMaskEditor(false);
    toast.success("Mask created successfully!");
  }, []);

  const handleGenerateImageDescription = useCallback(async () => {
    if (!currentImage) {
      toast.error("Please upload an image first");
      return;
    }
    
    // TODO: Implement image-to-text using OpenAI Vision API
    toast.info("Image description feature coming soon!");
  }, [currentImage]);

  const handleGenerate = useCallback(async () => {
    if (!currentImage || !prompt.trim()) {
      toast.error("Please upload an image and enter a prompt");
      return;
    }

    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    setIsGenerating(true);
    try {
      // Save input image to Supabase first
      const { data: inputData, error: inputError } = await supabase
        .from('input_images')
        .insert({
          url: currentImage,
          prompt: prompt,
          filename: `input_${Date.now()}.jpg`
        })
        .select()
        .single();

      if (inputError) throw inputError;

      let maskId = null;
      // TODO: Implement mask saving once types are updated
      // if (maskData) {
      //   maskId = 'temp-mask-id';
      // }

      // TODO: Implement actual AI generation API call
      // For now, simulate generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: currentImage, // In real app, this would be the generated image
        prompt,
        negative_prompt: negativePrompt || undefined,
        timestamp: new Date(),
        model: selectedModel,
        controlnet_module: selectedControlNet !== "none" ? selectedControlNet : undefined,
        denoising_strength: denoisingStrength,
        guidance_scale: guidanceScale,
        seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed,
      };

      // TODO: Save generated image metadata once types are updated
      // await supabase.from('generated_images').insert({...});

      setGeneratedImages(prev => [newImage, ...prev]);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [currentImage, prompt, negativePrompt, selectedModel, selectedControlNet, denoisingStrength, guidanceScale, seed, maskData]);

  const handleImageReuse = useCallback((image: GeneratedImage) => {
    setCurrentImage(image.url);
    setPrompt(image.prompt);
    setNegativePrompt(image.negative_prompt || "");
    toast.success("Image loaded for further editing!");
  }, []);

  if (showMaskEditor && currentImage) {
    return (
      <MaskEditor
        imageUrl={currentImage}
        onSave={handleMaskSave}
        onCancel={() => setShowMaskEditor(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-editor-border bg-editor-surface/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-editor-text">Orau</h1>
              <p className="text-sm text-editor-muted">Photorealistic Image Editor</p>
            </div>
            <div className="text-xs text-editor-muted">
              Professional AI-powered photo editing
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Image & Editing */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-medium border-editor-border">
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={currentImage}
                onRemoveImage={() => {
                  setCurrentImage("");
                  setMaskData("");
                }}
                onEditMask={() => setShowMaskEditor(true)}
                hasMask={!!maskData}
              />
            </Card>
            
            <Card className="p-6 shadow-medium border-editor-border">
              <EditingControls
                prompt={prompt}
                onPromptChange={setPrompt}
                negativePrompt={negativePrompt}
                onNegativePromptChange={setNegativePrompt}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                selectedControlNet={selectedControlNet}
                onControlNetChange={setSelectedControlNet}
                denoisingStrength={denoisingStrength}
                onDenoisingStrengthChange={setDenoisingStrength}
                guidanceScale={guidanceScale}
                onGuidanceScaleChange={setGuidanceScale}
                seed={seed}
                onSeedChange={setSeed}
                onGenerate={handleGenerate}
                onGenerateDescription={handleGenerateImageDescription}
                isGenerating={isGenerating}
                hasImage={!!currentImage}
              />
            </Card>
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            <GeneratedResults
              images={generatedImages}
              onImageReuse={handleImageReuse}
            />
          </div>
        </div>
      </main>
    </div>
  );
};