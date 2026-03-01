'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export function ImageUploader({
  onFileSelect,
  selectedFile,
  disabled,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
        loadPreview(file);
      }
    },
    [onFileSelect, loadPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    disabled,
  });

  const clearFile = () => {
    onFileSelect(null);
    setPreview(null);
  };

  if (selectedFile && preview) {
    return (
      <div className="bg-muted/50 relative rounded-lg border p-4 transition-all">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-70 transition-opacity hover:opacity-100"
          onClick={clearFile}
          disabled={disabled}
          title="Remove image"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border shadow-sm">
            <Image
              src={preview}
              alt={selectedFile.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-muted-foreground text-sm">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
              isDragActive ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            {isDragActive ? (
              <ImageIcon className="text-primary animate-in zoom-in-75 h-6 w-6 duration-150" />
            ) : (
              <Upload className="text-muted-foreground h-6 w-6" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              or click to browse (max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            Supported formats: JPEG, PNG, WebP
          </p>
        </div>
      </div>

      {/* Camera capture — shown only on touch devices via CSS */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
            loadPreview(file);
          }
          // Reset so the same file can be re-selected
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex w-full items-center gap-2 sm:hidden"
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
        Take a Photo
      </Button>
    </div>
  );
}
