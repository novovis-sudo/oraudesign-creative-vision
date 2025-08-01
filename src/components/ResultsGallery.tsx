import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Heart, Share } from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  model: string;
  liked?: boolean;
}

interface ResultsGalleryProps {
  images: GeneratedImage[];
  onImageSelect: (image: GeneratedImage) => void;
  onToggleLike: (id: string) => void;
  onDownload: (image: GeneratedImage) => void;
  onShare: (image: GeneratedImage) => void;
}

export const ResultsGallery = ({
  images,
  onImageSelect,
  onToggleLike,
  onDownload,
  onShare
}: ResultsGalleryProps) => {
  if (images.length === 0) {
    return (
      <Card className="p-12 text-center shadow-soft">
        <div className="w-16 h-16 mx-auto bg-muted rounded-xl flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No generations yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload an image and create your first AI masterpiece
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Generations</h3>
        <span className="text-sm text-muted-foreground">{images.length} results</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="group overflow-hidden cursor-pointer shadow-soft hover:shadow-medium transition-all duration-200"
            onClick={() => onImageSelect(image)}
          >
            <div className="relative aspect-square">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(image.id);
                  }}
                  className={image.liked ? "text-red-500" : ""}
                >
                  <Heart className={`w-4 h-4 ${image.liked ? "fill-current" : ""}`} />
                </Button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(image);
                  }}
                  className="flex-1 gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(image);
                  }}
                  className="flex-1 gap-1"
                >
                  <Share className="w-3 h-3" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <p className="text-sm text-foreground line-clamp-2 font-medium">
                {image.prompt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{image.model}</span>
                <span>{image.timestamp.toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};