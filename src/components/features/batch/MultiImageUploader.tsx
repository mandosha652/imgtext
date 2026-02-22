'use client';

import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_BATCH_SIZE,
} from '@/lib/constants';

interface MultiImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  selectedFiles: File[];
  disabled?: boolean;
}

export function MultiImageUploader({
  onFilesChange,
  selectedFiles,
  disabled,
}: MultiImageUploaderProps) {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [previewImage, setPreviewImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPreviews = async () => {
      const newPreviews = new Map<string, string>();
      for (const file of selectedFiles) {
        if (cancelled) break;
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        const preview = await generatePreview(file);
        if (cancelled) break;
        newPreviews.set(key, preview);
      }
      if (!cancelled) {
        setPreviews(newPreviews);
      }
    };
    loadPreviews();

    return () => {
      cancelled = true;
    };
  }, [selectedFiles, generatePreview]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = MAX_BATCH_SIZE - selectedFiles.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      onFilesChange([...selectedFiles, ...filesToAdd]);
    },
    [selectedFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
      },
      maxSize: MAX_FILE_SIZE_BYTES,
      multiple: true,
      disabled: disabled || selectedFiles.length >= MAX_BATCH_SIZE,
    });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const clearAll = () => {
    onFilesChange([]);
    setPreviews(new Map());
  };

  const getFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified}`;

  const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          disabled || selectedFiles.length >= MAX_BATCH_SIZE
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200',
              isDragActive ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            {isDragActive ? (
              <ImageIcon className="text-primary animate-in zoom-in-75 h-5 w-5 duration-150" />
            ) : (
              <Upload className="text-muted-foreground h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isDragActive
                ? 'Drop images here'
                : 'Drag & drop images, or click to browse'}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Up to {MAX_BATCH_SIZE} images, max {MAX_FILE_SIZE_MB}MB each
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            Supported: JPEG, PNG, WebP
          </p>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
          <div className="mb-1.5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">
              {fileRejections.length} file
              {fileRejections.length !== 1 ? 's' : ''} rejected
            </span>
          </div>
          <ul className="ml-6 space-y-0.5">
            {fileRejections.slice(0, 3).map(({ file, errors }) => (
              <li key={file.name} className="text-xs">
                <span className="font-medium">{file.name}</span>
                {' — '}
                {errors[0]?.code === 'file-too-large'
                  ? `too large (max ${MAX_FILE_SIZE_MB}MB)`
                  : errors[0]?.code === 'file-invalid-type'
                    ? 'unsupported format (JPEG, PNG, WebP only)'
                    : (errors[0]?.message ?? 'rejected')}
              </li>
            ))}
            {fileRejections.length > 3 && (
              <li className="text-xs opacity-70">
                +{fileRejections.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {selectedFiles.length} of {MAX_BATCH_SIZE} images ({totalSizeMB}{' '}
              MB total)
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
            >
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {selectedFiles.map((file, index) => {
              const key = getFileKey(file);
              const preview = previews.get(key);

              return (
                <div
                  key={key}
                  className="group bg-muted/50 relative overflow-hidden rounded-lg border"
                >
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() =>
                      preview && setPreviewImage({ file, preview })
                    }
                  >
                    {preview ? (
                      <Image
                        src={preview}
                        alt={file.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <Skeleton className="absolute inset-0 rounded-none" />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1">
                    <p className="truncate text-xs text-white">{file.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="space-y-2">
            <DialogTitle>{previewImage?.file.name}</DialogTitle>
            <p className="text-muted-foreground text-sm">
              {previewImage &&
                `${(previewImage.file.size / 1024 / 1024).toFixed(2)} MB`}
            </p>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            {previewImage && (
              <Image
                src={previewImage.preview}
                alt={previewImage.file.name}
                fill
                className="object-contain"
                unoptimized
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
