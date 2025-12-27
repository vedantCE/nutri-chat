import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  onRemoveImage: () => void;
  selectedImage?: string;
}

export const ImageUpload = ({ onImageSelect, onRemoveImage, selectedImage }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (selectedImage) {
    return (
      <div className="relative inline-block">
        <img 
          src={selectedImage} 
          alt="Uploaded ingredient list" 
          className="max-w-xs max-h-32 rounded-lg border border-border object-cover"
        />
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          onClick={onRemoveImage}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileSelect}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileSelect}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        Camera
      </Button>
    </div>
  );
};