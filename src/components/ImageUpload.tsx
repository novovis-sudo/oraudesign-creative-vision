import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Link, X, Edit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ImageUploadProps {
  onImageSelect: (file: File | string) => void;
  currentImage?: string;
  onRemoveImage: () => void;
  onEditMask?: () => void;
  hasMask?: boolean;
}

export const ImageUpload = ({ onImageSelect, currentImage, onRemoveImage, onEditMask, hasMask }: ImageUploadProps) => {
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
      <Card className="relative group overflow-hidden">
        <img 
          src={currentImage} 
          alt="Selected for editing" 
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Mask status indicator */}
        {hasMask && (
          <Badge className="absolute top-3 left-3 bg-green-500 text-white">
            <Shield className="w-3 h-3 mr-1" />
            Mask Applied
          </Badge>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onEditMask && (
            <Button
              size="icon"
              variant="secondary"
              onClick={onEditMask}
              className="bg-white/90 hover:bg-white text-editor-text"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={onRemoveImage}
            className="bg-red-500/90 hover:bg-red-500 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom overlay with image info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium">Ready for editing</span>
            {onEditMask && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onEditMask}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="w-3 h-3 mr-1" />
                {hasMask ? 'Edit Mask' : 'Create Mask'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-300 ${
        dragActive 
          ? "border-editor-primary bg-editor-primary/5 shadow-large scale-[1.02]" 
          : "border-editor-border hover:border-editor-primary/50 shadow-soft hover:shadow-medium"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-editor-primary/10 to-editor-secondary/10 rounded-2xl flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-editor-primary" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-editor-text">
            Upload Your Photo
          </h3>
          <p className="text-editor-muted max-w-lg mx-auto leading-relaxed">
            Drop your image here or choose from your device. Supports JPG, PNG, and WebP formats up to 10MB.
          </p>
        </div>

        {!urlMode ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 h-12 px-8 bg-gradient-to-r from-editor-primary to-editor-secondary text-white font-semibold hover:opacity-90 transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              Browse Files
            </Button>
            <Button
              variant="outline"
              onClick={() => setUrlMode(true)}
              className="gap-2 h-12 px-8 border-editor-border text-editor-text hover:bg-editor-elevated"
            >
              <Link className="w-5 h-5" />
              Paste URL
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 max-w-lg mx-auto">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              className="flex-1 h-12 border-editor-border focus:border-editor-primary"
            />
            <Button 
              onClick={handleUrlSubmit} 
              disabled={!imageUrl.trim()}
              className="h-12 px-6 bg-editor-primary text-white"
            >
              Load
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setUrlMode(false)}
              className="h-12 px-4 text-editor-muted"
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-editor-subtle">
          <p className="text-xs text-editor-muted">
            Or paste an image from your clipboard (Ctrl+V / Cmd+V)
          </p>
        </div>

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