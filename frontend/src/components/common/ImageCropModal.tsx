'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, X, Check } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  cropShape?: 'round' | 'rect';
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  cropShape = 'round',
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageSrc && isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [imageSrc, isOpen]);

  // Mouse Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch Drag for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(0.6, prev + delta), 3.0));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Crop & Export
  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const size = 360;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cropBoxSize = 220;
    const naturalWidth = img.naturalWidth || 1;
    const naturalHeight = img.naturalHeight || 1;

    const cropCenterX = img.width / 2 - offset.x / zoom;
    const cropCenterY = img.height / 2 - offset.y / zoom;

    const sourceWidth = (cropBoxSize / zoom) * (naturalWidth / img.width);
    const sourceHeight = (cropBoxSize / zoom) * (naturalHeight / img.height);

    const sourceX = (cropCenterX - cropBoxSize / (2 * zoom)) * (naturalWidth / img.width);
    const sourceY = (cropCenterY - cropBoxSize / (2 * zoom)) * (naturalHeight / img.height);

    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedBase64);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
        {/* Minimal Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Adjust Photo</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Crop Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-full aspect-square max-w-[260px] mx-auto rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.05s ease-out',
              maxWidth: '100%',
              maxHeight: '100%',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            className="object-contain"
          />

          {/* Clean Mask */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[220px] h-[220px] border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ${
                cropShape === 'round' ? 'rounded-full' : 'rounded-2xl'
              }`}
            />
          </div>
        </div>

        {/* Minimal Zoom Slider */}
        <div className="flex items-center gap-3 px-2">
          <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0.6"
            max="3.0"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 text-xs font-bold text-white bg-[#005A36] hover:bg-[#03442e] rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
