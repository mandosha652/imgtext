'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

export interface ZoomableImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function ZoomableImage({ src, alt, priority }: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const lastDistRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getMidpoint = (touches: React.TouchList, rect: DOMRect) => ({
    x:
      (((touches[0].clientX + touches[1].clientX) / 2 - rect.left) /
        rect.width) *
      100,
    y:
      (((touches[0].clientY + touches[1].clientY) / 2 - rect.top) /
        rect.height) *
      100,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDistRef.current = getDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || lastDistRef.current === null) return;
    e.preventDefault();
    const dist = getDistance(e.touches);
    const delta = dist / lastDistRef.current;
    lastDistRef.current = dist;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setOrigin(getMidpoint(e.touches, rect));
    }
    setScale(s => Math.min(Math.max(s * delta, 1), 4));
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistRef.current = null;
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(s => (s > 1 ? 1 : 2));
    setOrigin({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-muted relative aspect-video touch-none overflow-hidden rounded-lg border"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain transition-transform duration-100 will-change-transform"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
        unoptimized
        priority={priority}
      />
      {scale > 1 && (
        <button
          onClick={() => {
            setScale(1);
            setOrigin({ x: 50, y: 50 });
          }}
          aria-label="Reset zoom"
          className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
        >
          Reset zoom
        </button>
      )}
    </div>
  );
}
