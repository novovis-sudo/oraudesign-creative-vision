import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Link, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  onImageSelect: (file: File | string) => void;
  currentImage?: string;
  onRemoveImage: () => void;
}

export const ImageUpload = ({ onImageSelect, currentImage, onRemoveImage }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  }, [onImageSelect]);

  const handleUrlSubmit = useCallback(() => {
    if (imageUrl.trim()) {
      onImageSelect(imageUrl.trim());
      setImageUrl("");
      setUrlMode(false);
    }
  }, [imageUrl, onImageSelect]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onImageSelect(file);
            return;
          }
        }
      }
    }
  }, [onImageSelect]);

  if (currentImage) {
    return (
      <Card className="relative group overflow-hidden shadow-medium">
        <img 
          src={currentImage} 
          alt="Selected for editing" 
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={onRemoveImage}
        >
          <X className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-200 ${
        dragActive 
          ? "border-primary bg-primary/5 shadow-large" 
          : "border-border hover:border-primary/50 shadow-soft hover:shadow-medium"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="p-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-muted rounded-xl flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Upload or paste your image
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Drag and drop an image, paste from clipboard, upload from device, or use a URL
          </p>
        </div>

        {!urlMode ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="gradient"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
            <Button
              variant="outline"
              onClick={() => setUrlMode(true)}
              className="gap-2"
            >
              <Link className="w-4 h-4" />
              Use URL
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
              Load
            </Button>
            <Button variant="ghost" onClick={() => setUrlMode(false)}>
              Cancel
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};