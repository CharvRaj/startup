import { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Sparkles, Scissors, Heart, Droplets, Crown, Feather,
  CheckCircle, CheckCircle2, PlayCircle, Clock, Award, BookOpen, Layers,
  ChevronLeft, ChevronRight, Check, AlertCircle, ArrowLeft, ShieldCheck,
  FileText, Download, Share2, Compass, Play, Pause, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  trainingService,
  CourseCategory,
  CourseSubcategory,
  CourseLesson,
  LessonProgress,
} from '@/lib/trainingService';

interface Props {
  stylistId?: string;
  stylistName?: string;
}

export function StylistTrainingAcademy({ stylistId = 'current_stylist', stylistName = 'Stylist Partner' }: Props) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [activeNav, setActiveNav] = useState<string>('dashboard'); // 'dashboard' | 'my-courses' | 'progress' | 'certificates' | category.name
  const [selectedSubcategory, setSelectedSubcategory] = useState<CourseSubcategory | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  // Progress tracking
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [videoWatchedSecs, setVideoWatchedSecs] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = () => {
    const cats = trainingService.getCategories('stylist');
    setCategories(cats);
    const prog = trainingService.getEmployeeProgress(stylistId, 'stylist');
    setProgressList(prog);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('satguru:training_updated', handleUpdate);
    window.addEventListener('satguru:training_progress_updated', handleUpdate);
    return () => {
      window.removeEventListener('satguru:training_updated', handleUpdate);
      window.removeEventListener('satguru:training_progress_updated', handleUpdate);
    };
  }, [stylistId]);

  // Video playback simulation / tracking for lesson completion
  useEffect(() => {
    if (activeLesson) {
      // Find existing progress
      const existing = progressList.find(p => p.lesson_id === activeLesson.id);
      const startSecs = existing?.watched_seconds || 0;
      setVideoWatchedSecs(startSecs);
      const totalDurSecs = (activeLesson.duration_minutes || 15) * 60;
      setVideoDuration(totalDurSecs);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    }
  }, [activeLesson]);

  useEffect(() => {
    if (isPlaying && activeLesson) {
      videoTimerRef.current = setInterval(() => {
        setVideoWatchedSecs(prev => {
          const next = prev + 5;
          if (next >= videoDuration) {
            // Auto complete!
            trainingService.markLessonComplete(stylistId, 'stylist', activeLesson.id);
            toast({
              title: 'Lesson Completed! 🎓✨',
              description: `Congratulations! You mastered "${activeLesson.title}".`,
            });
            setIsPlaying(false);
            if (videoTimerRef.current) clearInterval(videoTimerRef.current);
            return videoDuration;
          }
          trainingService.saveLessonProgress({
            employee_id: stylistId,
            employee_role: 'stylist',
            lesson_id: activeLesson.id,
            watched_seconds: next,
            video_duration: videoDuration,
            completed: false,
          });
          return next;
        });
      }, 5000);
    } else {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    }
    return () => {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    };
  }, [isPlaying, activeLesson, videoDuration]);

  // Stats calculation
  const stats = trainingService.getEmployeeStats(stylistId, 'stylist');

  const isLessonCompleted = (lessonId: string) => {
    return progressList.some(p => p.lesson_id === lessonId && p.completed);
  };

  // Find Category by nav
  const activeCategory = categories.find(c => c.name.toLowerCase() === activeNav.toLowerCase());

  // Navigation handlers
  const handleSelectNav = (navKey: string) => {
    setActiveNav(navKey);
    setActiveLesson(null);
    const cat = categories.find(c => c.name.toLowerCase() === navKey.toLowerCase());
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0]);
    } else {
      setSelectedSubcategory(null);
    }
  };

  const handleSelectLesson = (lesson: CourseLesson) => {
    setActiveLesson(lesson);
  };

  const handleNextLesson = () => {
    if (!selectedSubcategory || !activeLesson) return;
    const currIdx = selectedSubcategory.lessons.findIndex(l => l.id === activeLesson.id);
    if (currIdx >= 0 && currIdx < selectedSubcategory.lessons.length - 1) {
      setActiveLesson(selectedSubcategory.lessons[currIdx + 1]);
    } else {
      toast({ title: 'You have reached the last lesson in this module! 🎉' });
    }
  };

  const handlePrevLesson = () => {
    if (!selectedSubcategory || !activeLesson) return;
    const currIdx = selectedSubcategory.lessons.findIndex(l => l.id === activeLesson.id);
    if (currIdx > 0) {
      setActiveLesson(selectedSubcategory.lessons[currIdx - 1]);
    }
  };

  const handleManualComplete = () => {
    if (!activeLesson) return;
    trainingService.markLessonComplete(stylistId, 'stylist', activeLesson.id);
    setVideoWatchedSecs(videoDuration);
    toast({
      title: 'Lesson Marked Complete! ✅',
      description: `Training progress updated for "${activeLesson.title}".`,
    });
  };

  return (
    <div className="bg-[#FFF9F3] rounded-3xl border border-[#F5DCE1] overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[750px] antialiased">
      {/* ── DEDICATED LEFT SIDEBAR ── */}
      <aside className="w-full lg:w-64 bg-white border-r border-[#F5DCE1] p-5 flex flex-col flex-shrink-0 space-y-6">
        {/* Academy Branding Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#F5DCE1]/70">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FDF0F4] to-[#FFF3DC] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] shadow-xs">
            <GraduationCap className="w-5 h-5 text-[#C83E68]" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-sm text-[#342A29]">
              BlindGlow Academy
            </h3>
            <p className="text-[10px] text-[#542337]/60 uppercase tracking-wider font-semibold">
              Stylist Education Platform
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 text-xs">
          {/* Main sections */}
          <div className="space-y-1 mb-4">
            <button
              onClick={() => handleSelectNav('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white shadow-xs'
                  : 'text-[#542337]/75 hover:bg-[#FDF0F4] hover:text-[#342A29]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Training Dashboard</span>
            </button>
            <button
              onClick={() => handleSelectNav('my-courses')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                activeNav === 'my-courses'
                  ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white shadow-xs'
                  : 'text-[#542337]/75 hover:bg-[#FDF0F4] hover:text-[#342A29]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Courses</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-[#C83E68] font-bold">
                {categories.length}
              </span>
            </button>
          </div>

          {/* Service-wise Training Categories Header */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#542337]/50 px-3 pt-2 mb-1">
            Service Modules
          </p>

          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeNav.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectNav(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-[#133826] text-white shadow-xs font-bold'
                      : 'text-[#542337]/75 hover:bg-[#FFF9F5] hover:text-[#342A29]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-[#C83E68]'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#FFF3DC] text-[#B87A24]'
                  }`}>
                    {cat.subcategories.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress & Certification */}
          <div className="pt-4 border-t border-[#F5DCE1]/60 space-y-1">
            <button
              onClick={() => handleSelectNav('progress')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeNav === 'progress'
                  ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white shadow-xs font-bold'
                  : 'text-[#542337]/75 hover:bg-[#FDF0F4] hover:text-[#342A29]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>My Progress</span>
              <span className="ml-auto font-bold text-[10px] text-emerald-700">{stats.completionPercentage}%</span>
            </button>
            <button
              onClick={() => handleSelectNav('certificates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeNav === 'certificates'
                  ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white shadow-xs font-bold'
                  : 'text-[#542337]/75 hover:bg-[#FDF0F4] hover:text-[#342A29]'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Certificates</span>
            </button>
          </div>
        </nav>

        {/* Overall Completion Mini-Card */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#FFF9F5] to-[#FDF0F4] border border-[#F5DCE1] text-center space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#342A29]">Course Completion</span>
            <span className="font-bold text-[#C83E68]">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C83E68] to-[#133826] transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-[#542337]/65">
            {stats.completedLessons} of {stats.totalLessons} lessons finished
          </p>
        </div>
      </aside>

      {/* ── RIGHT MAIN CONTENT PANE ── */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[850px] space-y-6">
        {/* ── CASE A: ACTIVE LESSON VIDEO TRAINING PAGE ── */}
        {activeLesson ? (
          <div className="space-y-6 animate-fade-in">
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between gap-3 border-b border-[#F5DCE1] pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveLesson(null)}
                className="rounded-xl text-xs text-[#542337]/70 hover:text-[#342A29] gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {selectedSubcategory?.name || 'Lessons'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevLesson}
                  className="rounded-xl text-xs border-[#F5DCE1]"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextLesson}
                  className="rounded-xl text-xs border-[#F5DCE1]"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  onClick={handleManualComplete}
                  size="sm"
                  className={`rounded-xl text-xs font-bold gap-1.5 shadow-sm ${
                    isLessonCompleted(activeLesson.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#C83E68] hover:bg-[#A82E52] text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isLessonCompleted(activeLesson.id) ? 'Completed ✓' : 'Mark as Complete'}
                </Button>
              </div>
            </div>

            {/* Large Video Player Interface */}
            <div className="rounded-3xl overflow-hidden bg-black shadow-xl border border-stone-800">
              <div className="aspect-video w-full bg-black relative">
                {activeLesson.video_url?.includes('youtube.com') || activeLesson.video_url?.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeLesson.video_url.includes('v=') ? activeLesson.video_url.split('v=')[1]?.split('&')[0] : activeLesson.video_url.split('/').pop()}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={activeLesson.video_url} controls autoPlay className="w-full h-full object-contain" />
                )}
              </div>

              {/* Video Playback & Automatic Tracker Strip */}
              <div className="p-4 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold flex items-center gap-1.5 text-rose-400">
                    <PlayCircle className="w-4 h-4 animate-pulse" />
                    Live Video Training
                  </span>
                  <span className="text-stone-400 text-[11px]">
                    {Math.floor(videoWatchedSecs / 60)}m / {activeLesson.duration_minutes}m Duration
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-36 h-2 rounded-full bg-stone-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C83E68] to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((videoWatchedSecs / videoDuration) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {Math.min(100, Math.round((videoWatchedSecs / videoDuration) * 100))}% Watched
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson Title & Overview */}
            <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#FFF3DC] text-[#B87A24] border-[#B87A24]/30 text-xs">
                      {selectedSubcategory?.name || 'Stylist Masterclass'}
                    </Badge>
                    <span className="text-xs text-[#542337]/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activeLesson.duration_minutes} Mins
                    </span>
                  </div>
                  <h2 className="font-serif italic text-2xl font-bold text-[#342A29] mt-1.5">
                    {activeLesson.title}
                  </h2>
                </div>
                {isLessonCompleted(activeLesson.id) && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 text-xs gap-1.5 font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Lesson Completed
                  </Badge>
                )}
              </div>

              <p className="text-xs text-[#542337]/80 leading-relaxed max-w-3xl">
                {activeLesson.description}
              </p>
            </div>

            {/* Detailed Instructions & Professional Guidelines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step-by-Step Instructions */}
              <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#342A29] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C83E68]" />
                  Step-by-Step Procedure Checklist
                </h4>
                {activeLesson.step_by_step && activeLesson.step_by_step.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeLesson.step_by_step.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1]/60 text-xs">
                        <span className="w-5 h-5 rounded-full bg-[#C83E68] text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[#342A29] leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Standard operational guidelines apply.</p>
                )}
              </div>

              {/* Tools & Products Checklist */}
              <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#342A29] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#C83E68]" />
                  Required Tools & Equipment Kit
                </h4>
                {activeLesson.required_tools && activeLesson.required_tools.length > 0 ? (
                  <div className="space-y-2">
                    {activeLesson.required_tools.map((tool, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFDFB] border border-[#F5DCE1]/70 text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-[#342A29]">{tool}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Included in standard BlindGlow kit.</p>
                )}
              </div>

              {/* Important Tips & Pro Hacks */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF9F5] to-[#FFF3DC]/40 border border-[#F5DCE1] shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-[#B87A24] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B87A24]" />
                  Master Stylist Pro Tips
                </h4>
                <div className="space-y-2">
                  {(activeLesson.important_tips || [
                    'Always consult client hair/skin history before starting.',
                    'Check symmetrical balance from multiple angles before client reveal.'
                  ]).map((tip, idx) => (
                    <p key={idx} className="text-xs text-[#542337]/80 leading-relaxed flex items-start gap-2">
                      <span className="text-[#B87A24] font-bold">•</span>
                      <span>{tip}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Safety & Hygiene Protocols */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FDF0F4]/60 to-white border border-[#F5DCE1] shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-[#C83E68] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C83E68]" />
                  Safety & Hygiene Protocols
                </h4>
                <div className="space-y-2">
                  {(activeLesson.safety_hygiene || [
                    'Sanitize all steel implements with 70% alcohol before client arrival.',
                    'Single-use disposable towels and cape mandatory for doorstep service.'
                  ]).map((item, idx) => (
                    <p key={idx} className="text-xs text-[#542337]/80 leading-relaxed flex items-start gap-2">
                      <span className="text-[#C83E68] font-bold">✓</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeCategory ? (
          /* ── CASE B: SERVICE CATEGORY & SUBCATEGORY VIEW ── */
          <div className="space-y-6 animate-fade-in">
            {/* Category Header Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-xl">
                <Badge className="bg-[#133826] text-white text-[10px] font-bold uppercase tracking-wider">
                  BlindGlow Training Module
                </Badge>
                <h2 className="font-serif italic text-2xl md:text-3xl font-bold text-[#342A29]">
                  {activeCategory.name}
                </h2>
                <p className="text-xs text-[#542337]/75 leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-[#F5DCE1] flex-shrink-0 shadow-md">
                <img src={activeCategory.thumbnail} alt={activeCategory.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Subcategories Tabs / Tiles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif italic font-bold text-lg text-[#342A29]">
                  Select Subcategory ({activeCategory.subcategories.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {activeCategory.subcategories.map(sub => {
                  const isSubActive = selectedSubcategory?.id === sub.id;
                  const lessonsCount = sub.lessons.length;
                  const completedInSub = sub.lessons.filter(l => isLessonCompleted(l.id)).length;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isSubActive
                          ? 'bg-white border-[#C83E68] shadow-md ring-2 ring-[#C83E68]/15'
                          : 'bg-[#FFFDFB] border-[#F5DCE1] hover:bg-white hover:border-[#C83E68]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSubActive ? 'bg-[#C83E68] text-white' : 'bg-[#FFF3DC] text-[#B87A24]'
                          }`}>
                            {lessonsCount} Lessons
                          </span>
                          {completedInSub === lessonsCount && lessonsCount > 0 && (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-[#342A29] group-hover:text-[#C83E68] transition-colors leading-tight">
                          {sub.name}
                        </h4>
                        <p className="text-[10px] text-[#542337]/65 line-clamp-2 mt-1">
                          {sub.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#F5DCE1]/60 flex items-center justify-between text-[10px] text-[#542337]/70 font-semibold">
                        <span>{completedInSub} / {lessonsCount} Completed</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#C83E68] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lessons Inside Selected Subcategory */}
            {selectedSubcategory && (
              <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5DCE1] pb-4">
                  <div>
                    <h3 className="font-serif italic text-xl font-bold text-[#342A29]">
                      {selectedSubcategory.name} Lessons
                    </h3>
                    <p className="text-xs text-[#542337]/70 mt-0.5">
                      {selectedSubcategory.description || 'Watch step-by-step videos and learn professional salon delivery.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#C83E68] bg-[#FDF0F4] px-3 py-1 rounded-full border border-[#F5DCE1]">
                    {selectedSubcategory.lessons.length} Videos Available
                  </span>
                </div>

                {selectedSubcategory.lessons.length === 0 ? (
                  <div className="p-8 text-center bg-[#FFF9F5] rounded-2xl border border-dashed border-[#F5DCE1] text-xs text-[#542337]/60">
                    No lessons published in this subcategory yet. Admin will update soon.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubcategory.lessons.map((lesson, idx) => {
                      const completed = isLessonCompleted(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                            completed
                              ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                              : 'bg-[#FFFDFB] border-[#F5DCE1] hover:border-[#C83E68]/60 hover:shadow-sm'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3DC] text-[#B87A24]">
                                Lesson #{idx + 1}
                              </span>
                              <span className="text-[11px] font-semibold text-[#542337]/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                              </span>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-100 to-rose-100 border border-purple-200 flex items-center justify-center text-[#C83E68] group-hover:scale-105 transition-transform flex-shrink-0">
                                <Play className="w-5 h-5 fill-current" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-[#342A29] group-hover:text-[#C83E68] transition-colors leading-snug">
                                  {lesson.title}
                                </h4>
                                <p className="text-[11px] text-[#542337]/70 line-clamp-2 mt-1">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-[#F5DCE1]/60 flex items-center justify-between">
                            {completed ? (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Completed
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-[#542337]/60">
                                Tap to start lesson
                              </span>
                            )}
                            <Button
                              size="sm"
                              className="h-7 text-xs rounded-lg bg-[#C83E68] hover:bg-[#A82E52] text-white font-bold px-3 gap-1"
                            >
                              Watch Video →
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeNav === 'certificates' ? (
          /* ── CASE C: CERTIFICATES VIEW ── */
          <div className="p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl mx-auto bg-gradient-to-tr from-[#FFF3DC] to-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center text-[#B87A24] shadow-sm">
              <Award className="w-8 h-8 text-[#B87A24]" />
            </div>
            <div>
              <h3 className="font-serif italic text-2xl font-bold text-[#342A29]">
                BlindGlow Certified Stylist Program
              </h3>
              <p className="text-xs text-[#542337]/70 mt-1 max-w-md mx-auto">
                Official certifications are unlocked when you complete 100% of the training lessons in all service modules.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1] text-left space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#542337]/70">Candidate:</span>
                <span className="font-bold text-[#342A29]">{stylistName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#542337]/70">Certification:</span>
                <span className="font-bold text-[#C83E68]">Elite Doorstep Beauty Specialist</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#542337]/70">Progress Status:</span>
                <span className="font-bold text-emerald-700">{stats.completionPercentage}% Completed</span>
              </div>

              {stats.completionPercentage >= 100 ? (
                <Button className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md">
                  <Download className="w-4 h-4" /> Download Official Certificate (PDF)
                </Button>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-center font-medium">
                  Complete {stats.pendingLessons} more lessons to unlock your certificate.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── CASE D: TRAINING DASHBOARD OVERVIEW ── */
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#FFFDFB] via-[#FFF9F5] to-[#FDF0F4] border border-[#F5DCE1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <Badge className="bg-[#C83E68] text-white text-[10px] font-bold uppercase tracking-wider">
                  BlindGlow Training Academy 2026
                </Badge>
                <h2 className="font-serif italic text-2xl md:text-3xl font-bold text-[#342A29]">
                  Welcome, {stylistName}!
                </h2>
                <p className="text-xs text-[#542337]/80 leading-relaxed">
                  Enhance your professional beauty artistry with certified masterclasses across Hair, Facials, Royal Bridal, Henna, Waxing, and Threading.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
                <div className="text-center sm:text-right">
                  <span className="text-3xl font-serif font-bold text-[#C83E68]">{stats.completionPercentage}%</span>
                  <p className="text-[11px] font-semibold text-[#542337]/60">Overall Course Progress</p>
                </div>
              </div>
            </div>

            {/* Quick Category Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif italic font-bold text-lg text-[#342A29]">
                  Curriculum Modules ({categories.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const subCount = cat.subcategories.length;
                  const lessonsCount = cat.subcategories.reduce((acc, s) => acc + s.lessons.length, 0);

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectNav(cat.name)}
                      className="p-5 rounded-3xl bg-white border border-[#F5DCE1] hover:border-[#C83E68] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="w-full h-32 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                          <img
                            src={cat.thumbnail}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#342A29] group-hover:text-[#C83E68] transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-[#542337]/65 line-clamp-2 mt-1">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#F5DCE1]/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#B87A24] bg-[#FFF3DC] px-2 py-0.5 rounded-full text-[10px]">
                          {subCount} Subcategories
                        </span>
                        <span className="font-bold text-[#C83E68] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Explore →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

