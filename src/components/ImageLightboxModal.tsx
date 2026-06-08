import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface LightboxImage {
  url: string;
  title: string;
  desc: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex
}: ImageLightboxModalProps) {
  
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleNext = () => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handlePrev = () => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
  };

  // Drag listeners when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setDragOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-fade-in text-white" 
      id="lightbox-fullscreen-overlay"
      onMouseUp={handleMouseUp}
    >
      {/* Top action header and controllers */}
      <div className="flex items-center justify-between p-2 sm:p-4 z-10 w-full max-w-7xl mx-auto" id="lightbox-top-actions">
        <div>
          <h4 className="text-xs font-serif font-extrabold tracking-widest uppercase text-sand leading-none">SOMNUS Rest Assays</h4>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wide">Click Gallery Magnification Mode</p>
        </div>

        {/* Zoom adjustment tools */}
        <div className="flex items-center space-x-2 bg-zinc-900/80 rounded-xl p-1 border border-zinc-800">
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Decrease magnification"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[10px] font-mono font-bold px-2 text-sand">{zoomLevel.toFixed(1)}x</span>
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel === 3.5}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-zinc-800 disabled:opacity-40"
            aria-label="Increase magnification"
          >
            <ZoomIn size={15} />
          </button>
          {zoomLevel > 1 && (
            <button 
              onClick={handleResetZoom}
              className="px-2.5 py-1 text-[8px] bg-sand text-midnight rounded font-black uppercase tracking-wider"
              aria-label="Reset scale"
            >
              Reset
            </button>
          )}
        </div>

        {/* Close button */}
        <button 
          onClick={() => {
            handleResetZoom();
            onClose();
          }}
          className="w-10 h-10 rounded-full hover:bg-zinc-800/80 bg-zinc-900 border border-zinc-800 flex items-center justify-center transition shrink-0"
          aria-label="Close Lightbox"
          id="lightbox-close-header"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Image container with left/right arrows */}
      <div 
        className="flex-1 w-full max-w-7xl mx-auto relative flex items-center justify-center overflow-hidden" 
        id="lightbox-active-viewport"
        onMouseMove={handleMouseMove}
      >
        {/* Left Arrow */}
        <button 
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-zinc-900/90 text-[#DCCDB2] border border-zinc-800 hover:bg-zinc-850 flex items-center justify-center transition active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Zoom Instructions Indicator */}
        {zoomLevel > 1 && (
          <div className="absolute top-4 bg-zinc-900/90 border border-zinc-800 text-[9px] uppercase tracking-wider font-extrabold text-sand px-3 py-1.5 rounded-full z-10 pointer-events-none">
            🖱️ drag mouse cursor to pan detailed mineral contours
          </div>
        )}

        {/* Image Display */}
        <div 
          className="w-full h-full max-h-[75vh] flex items-center justify-center select-none"
          onMouseDown={handleMouseDown}
          style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img 
            src={images[currentIndex].url} 
            alt={images[currentIndex].title}
            className="max-w-full max-h-full object-contain rounded-2xl smooth-transition pointer-events-none"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${dragOffset.x / zoomLevel}px, ${dragOffset.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Arrow */}
        <button 
          onClick={handleNext}
          className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-zinc-900/90 text-[#DCCDB2] border border-zinc-800 hover:bg-zinc-850 flex items-center justify-center transition active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide metadata status at bottom */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-zinc-900/70 border border-zinc-800/80 rounded-[1.5rem] mb-4 text-center z-10 font-sans" id="lightbox-info-pane">
        <div className="flex justify-between items-center text-[10px] text-sand font-bold tracking-[2px] uppercase">
          <span>{images[currentIndex].title}</span>
          <span className="font-mono bg-white/10 px-2 py-0.5 rounded-full">{currentIndex + 1} of {images.length}</span>
        </div>
        <p className="text-zinc-400 text-xs text-left mt-2 leading-relaxed font-normal">
          {images[currentIndex].desc || "No macro lens explanation attached to current rest batch specimen index."}
        </p>

        {/* Swipe Pips Navigation */}
        <div className="flex items-center justify-center space-x-1.5 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setZoomLevel(1);
                setDragOffset({ x: 0, y: 0 });
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-sand scale-125 w-4' : 'bg-zinc-700 hover:bg-zinc-500'}`}
              aria-label={`Show slide index ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
