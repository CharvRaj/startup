import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GraduationCap, Sparkles, Scissors, Heart, Droplets, Crown, Feather,
  CheckCircle, CheckCircle2, PlayCircle, Clock, Award, BookOpen, Layers,
  ChevronLeft, ChevronRight, Check, AlertCircle, ArrowLeft, ShieldCheck,
  FileText, Download, Share2, Compass, Play, Pause, RotateCcw, Search,
  Filter, Home, UserCheck, Store, Star, ArrowRight, ExternalLink, HelpCircle
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
  TargetRole
} from '@/lib/trainingService';
import { StylistTrainingAcademy } from '@/components/training/StylistTrainingAcademy';
import { AssociateTrainingSection } from '@/components/training/AssociateTrainingSection';

export function TrainingAcademy() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role can be 'stylist' or 'associate'
  const initialRole = (searchParams.get('role') as TargetRole) || 'stylist';
  const [role, setRole] = useState<TargetRole>(initialRole);

  const [activeTab, setActiveTab] = useState<'catalog' | 'my-progress' | 'certificates' | 'guidelines'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<CourseSubcategory | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  // Lesson player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoWatchedSecs, setVideoWatchedSecs] = useState(0);
  const [videoDuration, setVideoDuration] = useState(100);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Data
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);

  // Current employee identifier from session
  const employeeId = role === 'stylist'
    ? sessionStorage.getItem('member_session') || 'current_stylist'
    : sessionStorage.getItem('associate_session') || 'current_associate';

  const employeeName = role === 'stylist' ? 'Certified Doorstep Stylist' : 'Partner Salon Associate';

  const loadData = () => {
    const cats = trainingService.getCategories(role);
    setCategories(cats);
    const prog = trainingService.getEmployeeProgress(employeeId, role);
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
  }, [role, employeeId]);

  // Video progress timer simulation
  useEffect(() => {
    if (activeLesson) {
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
            trainingService.markLessonComplete(employeeId, role, activeLesson.id);
            toast({
              title: 'Lesson Completed! 🎓✨',
              description: `Congratulations! You mastered "${activeLesson.title}".`,
            });
            setIsPlaying(false);
            if (videoTimerRef.current) clearInterval(videoTimerRef.current);
            return videoDuration;
          }
          trainingService.saveLessonProgress({
            employee_id: employeeId,
            employee_role: role,
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
  }, [isPlaying, activeLesson, videoDuration, employeeId, role]);

  const stats = useMemo(() => {
    return trainingService.getEmployeeStats(employeeId, role);
  }, [progressList, employeeId, role]);

  // All subcategories flattened for search & filter
  const allSubcategories = useMemo(() => {
    return categories.flatMap(c =>
      c.subcategories.map(sc => ({
        ...sc,
        categoryName: c.name,
        categoryThumbnail: c.thumbnail,
      }))
    );
  }, [categories]);

  const filteredSubcategories = useMemo(() => {
    return allSubcategories.filter(sub => {
      const matchesCat =
        selectedCategoryFilter === 'all' || sub.categoryName === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.description.toLowerCase().includes(q) ||
        sub.categoryName.toLowerCase().includes(q) ||
        sub.lessons.some(l => l.title.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });
  }, [allSubcategories, selectedCategoryFilter, searchQuery]);

  const switchRole = (newRole: TargetRole) => {
    setRole(newRole);
    setSearchParams({ role: newRole });
    setSelectedSubcategory(null);
    setActiveLesson(null);
  };

  const isLessonComplete = (lessonId: string) => {
    return progressList.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getSubcategoryProgress = (sub: CourseSubcategory) => {
    if (!sub.lessons || sub.lessons.length === 0) return 0;
    const completed = sub.lessons.filter(l => isLessonComplete(l.id)).length;
    return Math.round((completed / sub.lessons.length) * 100);
  };

  // Certificate Print / Download
  const printCertificate = (courseTitle: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Satguru Academy Certificate</title>
        <style>
          body { font-family: 'Georgia', serif; padding: 40px; text-align: center; color: #43152E; background: #FFF9F3; }
          .border { border: 8px solid #D81B60; padding: 40px; border-radius: 20px; outline: 2px dashed #B55B33; outline-offset: -16px; background: #fff; }
          .logo { font-size: 28px; font-weight: bold; color: #D81B60; letter-spacing: 3px; }
          .subtitle { font-size: 11px; color: #B55B33; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; }
          h1 { font-size: 38px; color: #43152E; margin: 20px 0; font-style: italic; }
          p { font-size: 16px; line-height: 1.8; color: #555; }
          .name { font-size: 32px; font-weight: bold; color: #D81B60; margin: 20px 0; border-bottom: 2px solid #F8DCE4; display: inline-block; padding: 0 40px; }
          .course { font-size: 22px; font-weight: bold; color: #133826; margin: 15px 0; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="border">
          <div class="logo">✨ SATGURU MAKEUP ART ✨</div>
          <div class="subtitle">Herbal Beauty Parlour &amp; Professional Academy</div>
          <h1>Certificate of Professional Mastery</h1>
          <p>This is to certify that</p>
          <div class="name">${employeeName}</div>
          <p>has successfully completed all rigorous modules, practical hygiene protocols and practical mastery for</p>
          <div class="course">${courseTitle}</div>
          <p>Issued on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })} · Accredited Partner Skill Standard</p>
          <div class="footer">
            <div>Signature: <i>Dr. Sunita Devi</i><br>Master Aesthetician</div>
            <div>Verification ID: <b>SG-ACAD-${Math.random().toString(36).substring(2, 9).toUpperCase()}</b></div>
          </div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(certHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#43152E] font-sans antialiased">
      {/* ── Top Header Matching User Dashboard ── */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#F8DCE4] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#D81B60]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wider text-[#43152E] leading-tight">
                SATGURU ACADEMY
              </div>
              <div className="text-[8px] uppercase tracking-widest text-[#B55B33] font-semibold">
                PROFESSIONAL BEAUTY &amp; OPERATIONAL MASTERY
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={role === 'stylist' ? '/member-dashboard' : '/associate-dashboard'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] text-xs font-semibold text-[#43152E] hover:bg-[#FDF0F4] hover:text-[#D81B60] transition-all shadow-2xs"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D81B60]" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] text-xs font-semibold text-[#43152E] hover:bg-[#FDF0F4] hover:text-[#D81B60] transition-all shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-[#D81B60]" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* ── Main Academy Container ── */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* ── Track Switcher & Top Hero ── */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#F8DCE4] shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#F8DCE4]">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FDF0F4] text-[#D81B60] border border-[#F8DCE4]">
                  ISO 9001:2015 &amp; Herbal Sanitation Certified
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                  Accredited Standard
                </span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#43152E] leading-tight">
                Satguru Professional Beauty &amp; Operational Academy
              </h1>
              <p className="text-xs sm:text-sm text-[#43152E]/70 leading-relaxed">
                Step-by-step masterclasses, practical client handling workflows, strict hygiene protocols, and accredited certifications for our stylist network and parlour associates.
              </p>
            </div>

            {/* Track Switcher Pills */}
            <div className="p-1.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] flex items-center gap-1.5 shadow-2xs shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => switchRole('stylist')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'stylist'
                    ? 'bg-[#D81B60] text-white shadow-xs'
                    : 'text-[#43152E]/80 hover:text-[#D81B60] hover:bg-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Doorstep Stylist Academy</span>
              </button>
              <button
                type="button"
                onClick={() => switchRole('associate')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'associate'
                    ? 'bg-[#D81B60] text-white shadow-xs'
                    : 'text-[#43152E]/80 hover:text-[#D81B60] hover:bg-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Associate Parlour Training</span>
              </button>
            </div>
          </div>

          {/* 4 Performance Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#D81B60] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#43152E] font-bold text-lg leading-tight">{allSubcategories.length}</p>
                <p className="text-[#43152E]/60 text-xs font-medium">Courses Available</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#43152E] font-bold text-lg leading-tight">{stats.completed_lessons}</p>
                <p className="text-[#43152E]/60 text-xs font-medium">Modules Completed</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#43152E] font-bold text-lg leading-tight">{stats.completion_percentage}%</p>
                <p className="text-[#43152E]/60 text-xs font-medium">Academy Completion</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#43152E] font-bold text-lg leading-tight">{stats.completion_percentage >= 80 ? 'Certified' : 'In Training'}</p>
                <p className="text-[#43152E]/60 text-xs font-medium">Satguru Credential</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Subcategory Detail View (When a course is opened) ── */}
        {selectedSubcategory && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#F8DCE4] shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#F8DCE4]">
              <button
                type="button"
                onClick={() => { setSelectedSubcategory(null); setActiveLesson(null); }}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#D81B60] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
              </button>

              <Badge className="bg-[#FDF0F4] text-[#D81B60] border-[#F8DCE4] font-bold text-xs">
                {getSubcategoryProgress(selectedSubcategory)}% Mastered
              </Badge>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6">
              <img
                src={selectedSubcategory.thumbnail || '/images/banner-appointment.png'}
                alt={selectedSubcategory.name}
                className="w-full md:w-56 h-40 rounded-2xl object-cover border border-[#F8DCE4] shadow-xs"
              />
              <div className="space-y-2 flex-1">
                <div className="text-[11px] font-bold text-[#B55B33] uppercase tracking-wider">
                  Specialized Masterclass Series
                </div>
                <h2 className="font-serif font-bold text-2xl text-[#43152E]">
                  {selectedSubcategory.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#43152E]/70 leading-relaxed">
                  {selectedSubcategory.description}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-[#43152E]">
                    {selectedSubcategory.lessons.length} Step-by-Step Lessons
                  </span>
                  <span>•</span>
                  <span className="text-muted-foreground">
                    Est. Duration: {selectedSubcategory.lessons.reduce((s, l) => s + (l.duration_minutes || 15), 0)} Mins
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson Cards List */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#43152E]/80">
                Course Lessons &amp; Practical Modules
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedSubcategory.lessons.map((lesson, idx) => {
                  const done = isLessonComplete(lesson.id);
                  const isCurrent = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[#FDF0F4] border-[#D81B60] shadow-xs'
                          : done
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-[#FFF9F3] border-[#F8DCE4] hover:bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-muted-foreground">#{idx + 1}</span>
                          <span className="text-sm font-bold text-[#43152E]">{lesson.title}</span>
                          {done && <CheckCircle className="w-4 h-4 text-emerald-600 inline shrink-0" />}
                        </div>
                        <p className="text-xs text-[#43152E]/70 line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 font-medium">
                          <Clock className="w-3 h-3 text-[#D81B60]" /> {lesson.duration_minutes || 15} mins
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setActiveLesson(lesson)}
                        className={`shrink-0 rounded-xl text-xs font-bold ${
                          isCurrent
                            ? 'bg-[#D81B60] text-white shadow-xs'
                            : 'bg-white hover:bg-[#FDF0F4] border border-[#F8DCE4] text-[#43152E]'
                        }`}
                      >
                        {isCurrent ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1 text-[#D81B60]" />}
                        {done ? 'Review' : 'Start'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Lesson Interactive Studio Player */}
            {activeLesson && (
              <div className="rounded-3xl p-6 bg-[#FFF9F3] border-2 border-[#D81B60]/40 shadow-sm space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8DCE4]">
                  <div>
                    <span className="text-[10px] font-bold text-[#B55B33] uppercase tracking-wider">
                      Now Training
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#43152E]">
                      {activeLesson.title}
                    </h3>
                  </div>
                  <Badge className="bg-[#D81B60] text-white font-bold">
                    {Math.round((videoWatchedSecs / videoDuration) * 100)}% Watched
                  </Badge>
                </div>

                {/* Simulated Lesson Video Canvas / Player */}
                <div className="relative w-full h-56 sm:h-72 rounded-2xl bg-[#43152E] flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-[#D81B60] hover:bg-[#c2185b] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>
                    <p className="text-xs font-semibold tracking-wide text-white/90">
                      {isPlaying ? 'Playing High-Definition Masterclass Video...' : 'Video Paused (Click to Resume)'}
                    </p>
                  </div>

                  {/* Scrub Bar */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-[#D81B60] transition-all duration-300"
                        style={{ width: `${(videoWatchedSecs / videoDuration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/70 font-mono">
                      <span>{Math.floor(videoWatchedSecs / 60)}m {videoWatchedSecs % 60}s</span>
                      <span>{Math.floor(videoDuration / 60)}m 00s</span>
                    </div>
                  </div>
                </div>

                {/* Practical Protocols Tabs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                  {/* Step by Step */}
                  {activeLesson.step_by_step && activeLesson.step_by_step.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#D81B60] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Step-by-Step Procedure
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-[#43152E]/80">
                        {activeLesson.step_by_step.map((s, i) => (
                          <li key={i} className="leading-relaxed">{s}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Required Tools */}
                  {activeLesson.required_tools && activeLesson.required_tools.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#B55B33] flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" /> Sanitized Kit Checklist
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-[#43152E]/80">
                        {activeLesson.required_tools.map((t, i) => (
                          <li key={i} className="leading-relaxed">{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safety & Hygiene */}
                  {activeLesson.safety_hygiene && activeLesson.safety_hygiene.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Hygiene &amp; Sanitization
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-[#43152E]/80">
                        {activeLesson.safety_hygiene.map((sh, i) => (
                          <li key={i} className="leading-relaxed">{sh}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mark as Mastered button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => {
                      trainingService.markLessonComplete(employeeId, role, activeLesson.id);
                      toast({ title: 'Module Mastered! ✅', description: 'Recorded on your Satguru certification transcript.' });
                      loadData();
                    }}
                    className="h-11 px-6 rounded-2xl bg-[#133826] hover:bg-[#0c2419] text-white font-bold text-xs shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Mark Lesson as Mastered
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Main Course Catalog Grid ── */}
        {!selectedSubcategory && (
          <div className="space-y-6">
            {/* Filter Bar with Search & Category Pills */}
            <div className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search courses by skill, treatment, or protocol..."
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#43152E] text-xs font-semibold">
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#43152E]/70 shrink-0">
                  <span>Showing {filteredSubcategories.length} Course Series</span>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-[#D81B60] text-white'
                      : 'bg-[#FFF9F3] text-[#43152E]/80 border border-[#F8DCE4] hover:bg-[#FDF0F4]'
                  }`}
                >
                  All Categories ({allSubcategories.length})
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(c.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                      selectedCategoryFilter === c.name
                        ? 'bg-[#D81B60] text-white'
                        : 'bg-[#FFF9F3] text-[#43152E]/80 border border-[#F8DCE4] hover:bg-[#FDF0F4]'
                    }`}
                  >
                    {c.name} ({c.subcategories.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories Course Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubcategories.map(sub => {
                const prog = getSubcategoryProgress(sub);
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl overflow-hidden border border-[#F8DCE4] shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <img
                        src={sub.thumbnail || '/images/banner-appointment.png'}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#D81B60] shadow-xs border border-[#F8DCE4]">
                          {sub.categoryName}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#43152E]/90 text-white shadow-xs">
                          {sub.lessons.length} Lessons
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="font-serif font-bold text-lg text-[#43152E] group-hover:text-[#D81B60] transition-colors">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[#43152E]/70 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-[#F8DCE4]/60">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-[#43152E]/70">Progress</span>
                            <span className={prog === 100 ? 'text-emerald-700' : 'text-[#D81B60]'}>{prog}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#FFF9F3] border border-[#F8DCE4]/60 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                prog === 100 ? 'bg-emerald-600' : 'bg-[#D81B60]'
                              }`}
                              style={{ width: `${prog}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <Button
                            onClick={() => {
                              setSelectedSubcategory(sub);
                              if (sub.lessons?.[0]) setActiveLesson(sub.lessons[0]);
                            }}
                            className="w-full h-10 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <span>{prog > 0 ? 'Resume Course' : 'Start Course'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Certificates & Official Diplomas Section ── */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#F8DCE4] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F8DCE4]">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5 text-[#D81B60]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#43152E]">Official Academy Certification &amp; Diplomas</h3>
              <p className="text-xs text-[#43152E]/70">Download verifiable certificates for completed specialized training modules.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {allSubcategories.filter(sub => getSubcategoryProgress(sub) > 0).map(sub => {
              const isPassed = getSubcategoryProgress(sub) === 100;
              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#B55B33] uppercase">{sub.categoryName}</span>
                    <h4 className="font-serif font-bold text-sm text-[#43152E]">{sub.name}</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isPassed ? '✅ Certified' : `In Progress (${getSubcategoryProgress(sub)}%)`}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => printCertificate(sub.name)}
                      disabled={!isPassed}
                      className="h-8 px-3 rounded-xl bg-white hover:bg-[#FDF0F4] border border-[#F8DCE4] text-[#43152E] text-xs font-semibold gap-1"
                    >
                      <Download className="w-3 h-3 text-[#D81B60]" /> Print
                    </Button>
                  </div>
                </div>
              );
            })}
            {allSubcategories.every(sub => getSubcategoryProgress(sub) === 0) && (
              <div className="sm:col-span-3 py-6 text-center text-xs text-muted-foreground">
                Complete all lessons in a course series to unlock your verifiable accreditation certificate.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
