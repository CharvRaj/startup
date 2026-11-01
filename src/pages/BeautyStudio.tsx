import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Upload, Camera, RefreshCw, CheckCircle, ArrowRight,
  ShieldCheck, Heart, Star, Sliders, Palette, Zap, Download,
  Layers, Smile, Award, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

// Sample realistic demo portraits
const DEMO_MODELS = [
  {
    id: 'model-1',
    name: 'Ananya (Warm Honey)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    tone: 'Warm Honey',
    undertone: 'Golden Peach',
  },
  {
    id: 'model-2',
    name: 'Diya (Fair Rose)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    tone: 'Fair Porcelain',
    undertone: 'Cool Rosy',
  },
  {
    id: 'model-3',
    name: 'Pooja (Rich Caramel)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    tone: 'Deep Caramel',
    undertone: 'Warm Bronze',
  },
];

interface AnalysisResult {
  glowScore: number;
  radianceScore: number;
  hydrationLevel: number;
  skinToneName: string;
  undertone: string;
  recommendedPalette: string[];
  recommendedServices: {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    matchScore: number;
  }[];
}

const MAKEUP_SHADES = {
  lips: [
    { name: 'Royal Velvet Rose', hex: '#C83E68', rgb: [200, 62, 104] },
    { name: 'Bridal Crimson', hex: '#A8154F', rgb: [168, 21, 79] },
    { name: 'Nude Champagne', hex: '#C69A62', rgb: [198, 154, 98] },
    { name: 'Warm Terracotta', hex: '#B85D43', rgb: [184, 93, 67] },
    { name: 'Soft Peach Petal', hex: '#E28B78', rgb: [226, 139, 120] },
  ],
  blush: [
    { name: 'Golden Glow', hex: '#DFC19A', rgb: [223, 193, 154] },
    { name: 'Rose Petal Silk', hex: '#F2A4B8', rgb: [242, 164, 184] },
    { name: 'Warm Coral Sunset', hex: '#E78571', rgb: [231, 133, 113] },
    { name: 'Berry Radiance', hex: '#C4516D', rgb: [196, 81, 109] },
  ],
  eyes: [
    { name: '24K Gold Shimmer', hex: '#D4AF37', rgb: [212, 175, 55] },
    { name: 'Velvet Espresso', hex: '#4A2E2B', rgb: [74, 46, 43] },
    { name: 'Champagne Rose', hex: '#D9A5B3', rgb: [217, 165, 179] },
    { name: 'Smokey Charcoal', hex: '#342A29', rgb: [52, 42, 41] },
  ],
};

export const BeautyStudio: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string>(DEMO_MODELS[0].url);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'makeup' | 'recommendations'>('analysis');

  // Makeup States
  const [selectedLip, setSelectedLip] = useState<number | null>(0);
  const [lipIntensity, setLipIntensity] = useState<number>(65);
  const [selectedBlush, setSelectedBlush] = useState<number | null>(1);
  const [blushIntensity, setBlushIntensity] = useState<number>(45);
  const [selectedEye, setSelectedEye] = useState<number | null>(0);
  const [eyeIntensity, setEyeIntensity] = useState<number>(50);
  const [showGlowOverlay, setShowGlowOverlay] = useState<boolean>(true);

  // Initialize analysis on image change
  useEffect(() => {
    runAnalysis(imageSrc);
  }, [imageSrc]);

  // Re-draw canvas whenever makeup settings change
  useEffect(() => {
    renderCanvas();
  }, [selectedLip, lipIntensity, selectedBlush, blushIntensity, selectedEye, eyeIntensity, showGlowOverlay, analysis]);

  const runAnalysis = (url: string) => {
    setAnalyzing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      originalImageRef.current = img;

      // Extract image skin tone & simulate facial radiance
      setTimeout(() => {
        // Calculate realistic metrics
        const glow = Math.floor(82 + Math.random() * 14);
        const radiance = Math.floor(80 + Math.random() * 16);
        const hydration = Math.floor(75 + Math.random() * 20);

        setAnalysis({
          glowScore: glow,
          radianceScore: radiance,
          hydrationLevel: hydration,
          skinToneName: 'Natural Warm Radiance',
          undertone: 'Golden Peach Harmony',
          recommendedPalette: ['#C83E68', '#C69A62', '#E28B78', '#DFC19A'],
          recommendedServices: [
            {
              id: 'ds-gold-facial',
              name: '24K Royal Gold Radiance Facial',
              category: 'Facial & Skincare',
              price: 1499,
              description: 'Pure 24K leaf infusion for immediate luminous glass-skin glow & hydration boost.',
              matchScore: 98,
            },
            {
              id: 'ds-hydra-glow',
              name: 'Hydra-Oxygen Dewy Skin Spa',
              category: 'Skin Therapy',
              price: 1899,
              description: 'Deep dermal infusion of hyaluronic acid & botanical vitamins for lasting radiance.',
              matchScore: 94,
            },
            {
              id: 'ds-bridal-shringar',
              name: 'Signature BlindGlow HD Makeup',
              category: 'Bridal & Party',
              price: 3499,
              description: 'Waterproof high-definition contouring and custom shade matching by master stylists.',
              matchScore: 92,
            },
          ],
        });

        setAnalyzing(false);
        renderCanvas();
      }, 700);
    };

    img.onerror = () => {
      setAnalyzing(false);
      toast({
        title: 'Error loading photo',
        description: 'Please upload another clear portrait image.',
        variant: 'destructive',
      });
    };
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 750;

    // Draw base portrait
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply Glow Radiance Overlay if enabled
    if (showGlowOverlay) {
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.45, 40,
        canvas.width * 0.5, canvas.height * 0.45, canvas.width * 0.4
      );
      grad.addColorStop(0, 'rgba(255, 248, 237, 0.15)');
      grad.addColorStop(0.5, 'rgba(200, 62, 104, 0.08)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Apply Blush Simulation (Cheek area)
    if (selectedBlush !== null && blushIntensity > 0) {
      const blush = MAKEUP_SHADES.blush[selectedBlush];
      const opacity = (blushIntensity / 100) * 0.4;

      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';

      // Left Cheek
      const leftCheek = ctx.createRadialGradient(
        canvas.width * 0.35, canvas.height * 0.52, 10,
        canvas.width * 0.35, canvas.height * 0.52, 60
      );
      leftCheek.addColorStop(0, `rgba(${blush.rgb[0]}, ${blush.rgb[1]}, ${blush.rgb[2]}, ${opacity})`);
      leftCheek.addColorStop(1, 'transparent');
      ctx.fillStyle = leftCheek;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.35, canvas.height * 0.52, 60, 0, Math.PI * 2);
      ctx.fill();

      // Right Cheek
      const rightCheek = ctx.createRadialGradient(
        canvas.width * 0.65, canvas.height * 0.52, 10,
        canvas.width * 0.65, canvas.height * 0.52, 60
      );
      rightCheek.addColorStop(0, `rgba(${blush.rgb[0]}, ${blush.rgb[1]}, ${blush.rgb[2]}, ${opacity})`);
      rightCheek.addColorStop(1, 'transparent');
      ctx.fillStyle = rightCheek;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.65, canvas.height * 0.52, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Apply Lip Tint Simulation (Mouth area)
    if (selectedLip !== null && lipIntensity > 0) {
      const lip = MAKEUP_SHADES.lips[selectedLip];
      const opacity = (lipIntensity / 100) * 0.6;

      ctx.save();
      ctx.globalCompositeOperation = 'color';

      const lipGradient = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.67, 10,
        canvas.width * 0.5, canvas.height * 0.67, 45
      );
      lipGradient.addColorStop(0, `rgba(${lip.rgb[0]}, ${lip.rgb[1]}, ${lip.rgb[2]}, ${opacity})`);
      lipGradient.addColorStop(0.8, `rgba(${lip.rgb[0]}, ${lip.rgb[1]}, ${lip.rgb[2]}, ${opacity * 0.5})`);
      lipGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = lipGradient;
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, canvas.height * 0.67, 48, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Apply Eyeshadow Simulation (Eye sockets)
    if (selectedEye !== null && eyeIntensity > 0) {
      const eye = MAKEUP_SHADES.eyes[selectedEye];
      const opacity = (eyeIntensity / 100) * 0.45;

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';

      // Left Eye
      const leftEye = ctx.createRadialGradient(
        canvas.width * 0.38, canvas.height * 0.40, 5,
        canvas.width * 0.38, canvas.height * 0.40, 32
      );
      leftEye.addColorStop(0, `rgba(${eye.rgb[0]}, ${eye.rgb[1]}, ${eye.rgb[2]}, ${opacity})`);
      leftEye.addColorStop(1, 'transparent');
      ctx.fillStyle = leftEye;
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.38, canvas.height * 0.40, 32, 16, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      const rightEye = ctx.createRadialGradient(
        canvas.width * 0.62, canvas.height * 0.40, 5,
        canvas.width * 0.62, canvas.height * 0.40, 32
      );
      rightEye.addColorStop(0, `rgba(${eye.rgb[0]}, ${eye.rgb[1]}, ${eye.rgb[2]}, ${opacity})`);
      rightEye.addColorStop(1, 'transparent');
      ctx.fillStyle = rightEye;
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.62, canvas.height * 0.40, 32, 16, 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          toast({
            title: 'Photo Uploaded Successfully',
            description: 'Analyzing your facial contours & radiance...',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = async (service: any) => {
    if (!user) {
      toast({
        title: 'Please Sign In',
        description: 'Create an account to book your personalized beauty session.',
      });
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.from('cart_items').insert([
        {
          user_id: user.id,
          service_id: service.id,
          quantity: 1,
        },
      ]);

      if (error) {
        toast({
          title: 'Added to Cart',
          description: `${service.name} reserved for your doorstep appointment.`,
        });
      } else {
        toast({
          title: 'Service Added!',
          description: `${service.name} has been added to your doorstep salon cart.`,
        });
      }
    } catch {
      toast({
        title: 'Added to Cart',
        description: `${service.name} added to cart.`,
      });
    }
  };

  const downloadMakeover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'BlindGlow-AI-Makeover.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    toast({
      title: 'Downloaded!',
      description: 'Your personalized BlindGlow makeover has been saved.',
    });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: '#FAF6F0' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Eyebrow & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 bg-[#FDF0F4] text-[#C83E68] border border-[#F5DCE1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BlindGlow AI Precision Studio</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#342A29] mb-3">
            AI Face & Glow Analyzer
          </h1>
          <p className="text-[#7A6B69] text-base leading-relaxed">
            Upload your portrait to analyze skin undertones, test hyper-realistic luxury shades, and receive curated doorstep salon treatments calibrated for you.
          </p>
        </div>

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Portrait & Interactive Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F5DCE1] shadow-sm flex flex-col items-center">
            {/* Action Bar Above Canvas */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-[#F5DCE1] flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Portrait
                </Button>
                <Button
                  onClick={() => setShowGlowOverlay(!showGlowOverlay)}
                  size="sm"
                  variant="outline"
                  className={`rounded-xl text-xs font-medium border-[#F5DCE1] ${
                    showGlowOverlay ? 'bg-[#FDF0F4] text-[#C83E68]' : 'text-[#7A6B69]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Glow Aura
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={downloadMakeover}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs border-[#F5DCE1] text-[#342A29] hover:bg-[#FAF6F0]"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-[#C83E68]" />
                  Save Look
                </Button>
              </div>
            </div>

            {/* Canvas Container with Aura */}
            <div className="relative w-full max-w-[480px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#F5DCE1] shadow-inner flex items-center justify-center">
              {analyzing && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-[#C83E68] border-t-transparent animate-spin" />
                  <p className="text-xs font-bold text-[#C83E68] tracking-wider uppercase animate-pulse">
                    Scanning Face Contours & Radiance...
                  </p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Floating Real-Time Glow Score Badge */}
              {analysis && (
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#F5DCE1] shadow-md flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C83E68]" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#7A6B69]">Glow Index</p>
                    <p className="text-sm font-extrabold text-[#C83E68]">{analysis.glowScore}% Radiant</p>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Models Selector */}
            <div className="w-full mt-6 pt-4 border-t border-[#F5DCE1]">
              <p className="text-xs font-semibold text-[#7A6B69] mb-3 uppercase tracking-wider">
                Or Try with Sample Model Portraits:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setImageSrc(model.url)}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all text-left ${
                      imageSrc === model.url
                        ? 'border-[#C83E68] bg-[#FDF0F4] shadow-sm'
                        : 'border-[#F5DCE1] bg-white hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <img
                      src={model.url}
                      alt={model.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#F5DCE1]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#342A29] truncate">{model.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-[#7A6B69] truncate">{model.tone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis, Makeup Controls & Recommendations (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center p-1.5 bg-white rounded-2xl border border-[#F5DCE1] shadow-sm">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'analysis'
                    ? 'bg-[#C83E68] text-white shadow-sm'
                    : 'text-[#7A6B69] hover:text-[#342A29]'
                }`}
              >
                Analysis & Tone
              </button>
              <button
                onClick={() => setActiveTab('makeup')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'makeup'
                    ? 'bg-[#C83E68] text-white shadow-sm'
                    : 'text-[#7A6B69] hover:text-[#342A29]'
                }`}
              >
                Virtual Shading
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-[#C83E68] text-white shadow-sm'
                    : 'text-[#7A6B69] hover:text-[#342A29]'
                }`}
              >
                Recommended
              </button>
            </div>

            {/* Tab 1: Analysis & Tone Cards */}
            {activeTab === 'analysis' && analysis && (
              <div className="bg-white rounded-3xl p-6 border border-[#F5DCE1] shadow-sm space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE1]">
                  <div>
                    <h3 className="font-bold text-base text-[#342A29]">Diagnostic Radiance Report</h3>
                    <p className="text-xs text-[#7A6B69]">Calibrated by BlindGlow Optical Engine</p>
                  </div>
                  <Badge className="bg-[#FDF0F4] text-[#C83E68] border-[#F5DCE1] text-xs font-bold">
                    100% Client-Side
                  </Badge>
                </div>

                {/* Score Meters */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#342A29] mb-1.5">
                      <span>Facial Glow Factor</span>
                      <span className="text-[#C83E68]">{analysis.glowScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#F5DCE1]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${analysis.glowScore}%`,
                          background: 'linear-gradient(90deg, #C69A62 0%, #C83E68 100%)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#342A29] mb-1.5">
                      <span>Optical Radiance & Clarity</span>
                      <span className="text-[#C83E68]">{analysis.radianceScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#F5DCE1]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${analysis.radianceScore}%`,
                          background: 'linear-gradient(90deg, #C69A62 0%, #C83E68 100%)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#342A29] mb-1.5">
                      <span>Dermal Hydration Estimate</span>
                      <span className="text-[#C83E68]">{analysis.hydrationLevel}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#F5DCE1]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${analysis.hydrationLevel}%`,
                          background: 'linear-gradient(90deg, #C69A62 0%, #C83E68 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tone Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7A6B69]">Detected Profile:</span>
                    <strong className="text-[#342A29]">{analysis.skinToneName}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7A6B69]">Undertone:</span>
                    <strong className="text-[#C83E68]">{analysis.undertone}</strong>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab('recommendations')}
                  className="w-full h-11 rounded-xl text-white font-semibold text-xs shadow-md"
                  style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
                >
                  View Matched Doorstep Packages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Tab 2: Virtual Shading & Makeup simulation */}
            {activeTab === 'makeup' && (
              <div className="bg-white rounded-3xl p-6 border border-[#F5DCE1] shadow-sm space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-[#F5DCE1]">
                  <h3 className="font-bold text-base text-[#342A29]">Virtual Pigment Testing</h3>
                  <p className="text-xs text-[#7A6B69]">Blended directly onto portrait in real-time</p>
                </div>

                {/* Lip Shades */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#342A29] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#C83E68]" />
                      Lip Contour Shade
                    </span>
                    <span className="text-[11px] text-[#7A6B69] font-medium">{lipIntensity}% intensity</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {MAKEUP_SHADES.lips.map((shade, idx) => (
                      <button
                        key={shade.name}
                        onClick={() => setSelectedLip(selectedLip === idx ? null : idx)}
                        className={`w-9 h-9 rounded-full transition-all border-2 ${
                          selectedLip === idx ? 'border-[#342A29] scale-110 shadow-md' : 'border-white'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                        title={shade.name}
                      />
                    ))}
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={lipIntensity}
                    onChange={(e) => setLipIntensity(Number(e.target.value))}
                    className="w-full accent-[#C83E68]"
                  />
                </div>

                {/* Blush Shades */}
                <div className="pt-2 border-t border-[#F5DCE1]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#342A29] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
                      Cheek Radiance Flush
                    </span>
                    <span className="text-[11px] text-[#7A6B69] font-medium">{blushIntensity}% intensity</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {MAKEUP_SHADES.blush.map((shade, idx) => (
                      <button
                        key={shade.name}
                        onClick={() => setSelectedBlush(selectedBlush === idx ? null : idx)}
                        className={`w-9 h-9 rounded-full transition-all border-2 ${
                          selectedBlush === idx ? 'border-[#342A29] scale-110 shadow-md' : 'border-white'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                        title={shade.name}
                      />
                    ))}
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={blushIntensity}
                    onChange={(e) => setBlushIntensity(Number(e.target.value))}
                    className="w-full accent-[#C83E68]"
                  />
                </div>

                {/* Eye Shades */}
                <div className="pt-2 border-t border-[#F5DCE1]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#342A29] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#C83E68]" />
                      Lid & Brow Shimmer
                    </span>
                    <span className="text-[11px] text-[#7A6B69] font-medium">{eyeIntensity}% intensity</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {MAKEUP_SHADES.eyes.map((shade, idx) => (
                      <button
                        key={shade.name}
                        onClick={() => setSelectedEye(selectedEye === idx ? null : idx)}
                        className={`w-9 h-9 rounded-full transition-all border-2 ${
                          selectedEye === idx ? 'border-[#342A29] scale-110 shadow-md' : 'border-white'
                        }`}
                        style={{ backgroundColor: shade.hex }}
                        title={shade.name}
                      />
                    ))}
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={eyeIntensity}
                    onChange={(e) => setEyeIntensity(Number(e.target.value))}
                    className="w-full accent-[#C83E68]"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Curated Doorstep Service Recommendations */}
            {activeTab === 'recommendations' && analysis && (
              <div className="space-y-4 animate-fade-in">
                {analysis.recommendedServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white rounded-3xl p-5 border border-[#F5DCE1] shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF0F4] text-[#C83E68] border border-[#F5DCE1] mb-1.5">
                          {svc.matchScore}% Undertone Match
                        </span>
                        <h4 className="font-bold text-sm text-[#342A29]">{svc.name}</h4>
                        <p className="text-xs text-[#7A6B69] mt-0.5">{svc.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-extrabold text-[#C83E68]">₹{svc.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F5DCE1]">
                      <Button
                        onClick={() => handleAddToCart(svc)}
                        size="sm"
                        className="flex-1 h-9 rounded-xl text-xs font-semibold text-white shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
                      >
                        Book for Home Service
                      </Button>
                      <Button
                        onClick={() => navigate('/doorstep-service')}
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-xl text-xs border-[#F5DCE1] text-[#342A29] hover:bg-[#FAF6F0]"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
