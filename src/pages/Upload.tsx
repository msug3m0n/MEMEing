import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analyzeMeme } from '../services/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Upload as UploadIcon, Loader2, Sparkles, AlertCircle, Terminal, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import MemeEditor from '../components/MemeEditor';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsEditing(true); // Open editor immediately after selection
      };
      reader.readAsDataURL(selectedFile);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleEditorSave = (editedImage: string) => {
    setPreview(editedImage);
    setIsEditing(false);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = preview.split(',')[1];
      const result = await analyzeMeme(base64);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Try another one.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !preview || !analysis) return;
    setIsAnalyzing(true);
    try {
      const memeData = {
        userId: user.userId,
        imageUrl: preview,
        caption: analysis.caption,
        tags: analysis.tags,
        mood: analysis.mood,
        viralityScore: analysis.viralityScore,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'memes'), memeData);
      navigate('/');
    } catch (err) {
       console.error(err);
       setError("Failed to publish meme. Image might be too large for direct DB storage.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8 text-center bg-surface-soft border border-border-dim rounded-sm">
        <div className="w-20 h-20 bg-pink-vivid/10 rounded-full flex items-center justify-center text-pink-vivid">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl text-white uppercase tracking-tighter">Access Denied</h2>
          <p className="text-text-dim text-sm max-w-sm mx-auto uppercase tracking-widest font-mono">
            AUTHORIZATION_TOKEN_MISSING. PLEASE AUTHENTICATE TO PROCEED WITH DATA_INGESTION.
          </p>
        </div>
        <p className="text-[10px] font-mono text-cyan-vivid uppercase tracking-widest animate-pulse">Waiting for network identification...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {isEditing && preview && (
        <MemeEditor 
          imageSrc={preview} 
          onSave={handleEditorSave} 
          onCancel={() => setIsEditing(false)} 
        />
      )}

      <header className="flex justify-between items-end border-b border-border-dim pb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-pink-vivid rounded-full shadow-[0_0_10px_#FF007A]"></div>
            <span className="text-[11px] tracking-[0.3em] text-pink-vivid uppercase font-bold">Ingestion Sequence</span>
          </div>
          <h1 className="text-7xl font-black uppercase leading-none text-white tracking-tighter">DATA UPLOAD</h1>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <section className="space-y-6">
          <div
            className={cn(
              "aspect-square flex flex-col items-center justify-center p-8 transition-all tech-panel group relative overflow-hidden",
              preview ? "border-cyan-vivid/50" : "hover:border-white/20"
            )}
          >
            {preview ? (
              <div className="relative w-full h-full flex flex-col">
                <img src={preview} alt="Preview" className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-surface-solid border border-border-dim p-3 rounded-sm hover:border-cyan-vivid text-cyan-vivid transition-all"
                    title="Edit Meme"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setAnalysis(null); }}
                    className="bg-surface-solid border border-border-dim p-3 rounded-sm hover:border-pink-vivid text-pink-vivid transition-all"
                  >
                    <UploadIcon size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-6 cursor-pointer w-full h-full justify-center">
                <div className="w-20 h-20 bg-surface-solid border border-border-dim flex items-center justify-center text-text-dim group-hover:text-cyan-vivid group-hover:border-cyan-vivid transition-all">
                  <UploadIcon size={32} />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-lg uppercase tracking-tight">Drop Source Asset</p>
                  <p className="text-[10px] text-text-dim tracking-widest font-mono">PNG_JPG_HEIC_MAX_10MB</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!preview || isAnalyzing || !!analysis}
            className={cn(
              "w-full py-5 rounded-sm flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-xs transition-all border",
              analysis ? "bg-cyan-vivid/10 border-cyan-vivid/30 text-cyan-vivid cursor-default" : "bg-white text-black hover:bg-cyan-vivid hover:border-cyan-vivid disabled:opacity-30"
            )}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {analysis ? "SEQUENCE COMPLETE" : "EXECUTE AI_ANALYSIS"}
          </button>
        </section>

        {/* AI Results */}
        <section>
          <div className="tech-panel p-10 min-h-full flex flex-col gap-10">
            <div className="flex justify-between items-center border-b border-border-dim pb-4">
              <h3 className="text-xl flex items-center gap-3 font-display">
                <Terminal className="text-cyan-vivid" size={20} />
                SYSTEM_OUTPUT
              </h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-border-dim"></div>
                <div className="w-2 h-2 bg-border-dim"></div>
                <div className="w-2 h-2 bg-cyan-vivid"></div>
              </div>
            </div>

            {analysis ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Primary_Caption</label>
                  <p className="text-2xl font-bold leading-tight italic text-white italic">"{analysis.caption}"</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Predicted_Virality_Matrix</label>
                  <div className="flex items-center gap-6">
                    <div className="progress-bar flex-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.viralityScore}%` }}
                        className="progress-fill bg-cyan-vivid shadow-[0_0_10px_#00F5FF]"
                      />
                    </div>
                    <span className="font-mono text-3xl text-cyan-vivid font-black">{analysis.viralityScore}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Mood_Tone</label>
                    <p className="text-purple-vivid font-bold uppercase tracking-widest text-sm">{analysis.mood}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Metadata_Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {analysis.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] bg-border-dim px-2 py-1 rounded-sm border border-white/5 text-text-vivid font-mono uppercase">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={isAnalyzing}
                  className="w-full bg-pink-vivid text-white py-5 rounded-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all mt-10"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin inline mr-2" /> : "DEPLOY TO NETWORK"}
                </button>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <Sparkles size={64} className="text-border-dim animate-pulse" />
                </div>
                <div className="space-y-2">
                   <p className="uppercase tracking-[0.3em] text-xs font-bold text-text-dim">Waiting for Ingestion...</p>
                   <p className="text-[10px] text-[#333] font-mono">READY_STATE: IDLE</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-auto p-5 bg-pink-vivid/5 border border-pink-vivid/20 text-pink-vivid text-[11px] font-mono uppercase tracking-tight flex gap-3">
                <AlertCircle size={14} className="shrink-0" />
                <span>Error: {error}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
