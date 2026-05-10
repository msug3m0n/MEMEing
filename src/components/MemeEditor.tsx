import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Type, Palette, RotateCw, Crop, Check, X, Move } from 'lucide-react';
import { cn } from '../lib/utils';

interface MemeEditorProps {
  imageSrc: string;
  onSave: (editedImageBase64: string) => void;
  onCancel: () => void;
}

export default function MemeEditor({ imageSrc, onSave, onCancel }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [filter, setFilter] = useState('none');
  const [rotation, setRotation] = useState(0);

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Vintage', value: 'sepia(80%) contrast(1.1) brightness(0.9)' },
    { name: 'Cyber', value: 'hue-rotate(180deg) saturate(2)' },
    { name: 'Night', value: 'invert(0.1) brightness(0.8) contrast(1.2)' },
  ];

  useEffect(() => {
    draw();
  }, [imageSrc, topText, bottomText, filter, rotation]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      // Set canvas size (max 800px)
      const scale = Math.min(800 / img.width, 800 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation and filters
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.filter = filter;
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

      // Text setup
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = canvas.width * 0.01;
      const fontSize = canvas.width * 0.08;
      ctx.font = `bold ${fontSize}px IMPACT, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Draw Top Text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      }

      // Draw Bottom Text
      ctx.textBaseline = 'bottom';
      if (bottomText) {
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      }
    };
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 border-b border-border-dim pb-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-vivid tracking-[0.4em] font-bold uppercase">M3_RESOURCE_MODIFIER</span>
          <h2 className="text-4xl font-black text-white tracking-tighter">DATA EDITOR</h2>
        </div>
        <div className="flex gap-4">
           <button onClick={onCancel} className="p-4 tech-panel hover:border-pink-vivid text-pink-vivid">
             <X size={24} />
           </button>
           <button onClick={handleSave} className="p-4 tech-panel hover:border-cyan-vivid text-cyan-vivid">
             <Check size={24} />
           </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 gap-8 overflow-hidden">
        {/* Preview Area */}
        <div className="lg:col-span-8 bg-surface-soft border border-border-dim rounded-sm flex items-center justify-center p-4 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
           <canvas ref={canvasRef} className="max-w-full max-h-full shadow-[0_0_40px_rgba(0,0,0,0.5)] z-10" />
        </div>

        {/* Controls Area */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
           {/* Text Controls */}
           <div className="tech-panel p-6 space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-text-dim flex items-center gap-2">
                <Type size={14} /> TEXT_LAYER_INJECTION
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="TOP_TEXT..."
                  className="w-full bg-bg-deep border border-border-dim p-4 text-xs font-mono focus:border-cyan-vivid outline-none"
                />
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="BOTTOM_TEXT..."
                  className="w-full bg-bg-deep border border-border-dim p-4 text-xs font-mono focus:border-cyan-vivid outline-none"
                />
              </div>
           </div>

           {/* Filter Controls */}
           <div className="tech-panel p-6 space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-text-dim flex items-center gap-2">
                <Palette size={14} /> VISUAL_FILTER_MATRIX
              </h3>
              <div className="grid grid-cols-2 gap-2">
                 {filters.map((f) => (
                   <button
                     key={f.name}
                     onClick={() => setFilter(f.value)}
                     className={cn(
                       "py-3 border text-[10px] font-bold uppercase transition-all tracking-widest",
                       filter === f.value ? "border-cyan-vivid text-cyan-vivid bg-cyan-vivid/5" : "border-border-dim text-text-dim hover:border-white/20"
                     )}
                   >
                     {f.name}
                   </button>
                 ))}
              </div>
           </div>

           {/* Transform Controls */}
           <div className="tech-panel p-6 space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-text-dim flex items-center gap-2">
                <RotateCw size={14} /> TRANSFORM_GEOM
              </h3>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="flex-1 py-4 border border-border-dim text-xs font-mono hover:text-white transition-colors flex items-center justify-center gap-2"
                 >
                   <RotateCw size={14} /> ROTATE_90
                 </button>
              </div>
           </div>

           {/* Status Info */}
           <div className="p-4 border border-dashed border-border-dim bg-white/[0.02]">
              <p className="text-[9px] font-mono leading-relaxed text-text-dim uppercase">
                Resource is being modified in local volatile memory. Changes will be permanent after COMMIT sequence.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
