import { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, Clock, Calendar, BookOpen, Layers, PlayCircle,
  ShieldCheck, AlertCircle, CheckCircle, ArrowLeft, ChevronRight, FileText,
  HeartHandshake, Building2, Briefcase, Sparkles, Wallet, Home
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
  TrainingAssignment,
  LessonProgress,
} from '@/lib/trainingService';

interface Props {
  associateId?: string;
  associateName?: string;
}

export function AssociateTrainingSection({ associateId = 'current_associate', associateName = 'Associate Partner' }: Props) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<CourseSubcategory | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);

  const loadData = () => {
    const cats = trainingService.getCategories('associate');
    setCategories(cats);
    setAssignments(trainingService.getAssignments().filter(a => a.role === 'associate'));
    const prog = trainingService.getEmployeeProgress(associateId, 'associate');
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
  }, [associateId]);

  const stats = trainingService.getEmployeeStats(associateId, 'associate');

  const isCompleted = (lessonId: string) => progressList.some(p => p.lesson_id === lessonId && p.completed);

  const handleMarkComplete = (lessonId: string) => {
    trainingService.markLessonComplete(associateId, 'associate', lessonId);
    toast({
      title: 'Module Completed! ✅',
      description: 'Your compliance training progress has been recorded.',
    });
    loadData();
  };

  return (
    <div className="space-y-6 antialiased">
      {/* ── TOP BANNER & METRICS ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge className="bg-[#133826] text-white text-[10px] font-bold uppercase tracking-wider">
            Operational Compliance & Training
          </Badge>
          <h2 className="font-serif italic text-2xl md:text-3xl font-bold text-[#342A29]">
            Associate Professional Training Desk
          </h2>
          <p className="text-xs text-[#542337]/75 leading-relaxed">
            Master BlindGlow operational guidelines, doorstep customer handling, appointment coordination, hygiene standards, and conflict de-escalation.
          </p>
        </div>

        {/* Completion Overview Card */}
        <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1] flex items-center gap-5 flex-shrink-0">
          <div className="text-center">
            <span className="text-3xl font-serif font-bold text-[#133826]">{stats.completionPercentage}%</span>
            <p className="text-[10px] font-semibold text-[#542337]/60">Total Completion</p>
          </div>
          <div className="h-10 w-px bg-[#F5DCE1]" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#342A29]">{stats.completedLessons} Completed</p>
            <p className="text-[#C83E68] font-bold">{stats.pendingLessons} Pending</p>
          </div>
        </div>
      </div>

      {/* ── ASSIGNED COURSES & DEADLINES ── */}
      {assignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif italic text-base font-bold text-[#342A29] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C83E68]" />
            Assigned Mandates & Training Deadlines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(a => (
              <div key={a.id} className="p-4 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-center justify-between">
                <div>
                  <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                    {a.is_mandatory ? 'Mandatory Onboarding' : 'Optional Module'}
                  </Badge>
                  <h4 className="font-bold text-xs text-[#342A29] mt-1">{a.course_name}</h4>
                  <p className="text-[11px] text-[#542337]/65 mt-0.5">
                    Target: {a.assignee_type === 'all' ? 'All Associate Partners' : a.employee_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#542337]/60 uppercase font-semibold block">Deadline</span>
                  <span className="text-xs font-bold text-[#C83E68]">{a.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CASE 1: ACTIVE LESSON VIEW ── */}
      {activeLesson ? (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#F5DCE1] pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveLesson(null)}
              className="rounded-xl text-xs text-[#542337]/70 hover:text-[#342A29] gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {selectedSubcategory?.name || 'Lessons'}
            </Button>
            <Button
              onClick={() => handleMarkComplete(activeLesson.id)}
              size="sm"
              className={`rounded-xl text-xs font-bold gap-1.5 shadow-sm ${
                isCompleted(activeLesson.id)
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#133826] hover:bg-[#0c2419] text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isCompleted(activeLesson.id) ? 'Completed ✓' : 'Mark as Read & Understood'}
            </Button>
          </div>

          <div className="space-y-2">
            <Badge className="bg-[#FFF3DC] text-[#B87A24] border-[#B87A24]/30 text-xs">
              {selectedCategory?.name} → {selectedSubcategory?.name}
            </Badge>
            <h2 className="font-serif italic text-2xl font-bold text-[#342A29]">
              {activeLesson.title}
            </h2>
            <p className="text-xs text-[#542337]/80 leading-relaxed max-w-2xl">
              {activeLesson.description}
            </p>
          </div>

          {/* Embedded Video or Procedure Player */}
          {activeLesson.video_url && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-stone-800 max-h-[420px]">
              {activeLesson.video_url.includes('youtube.com') || activeLesson.video_url.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeLesson.video_url.includes('v=') ? activeLesson.video_url.split('v=')[1]?.split('&')[0] : activeLesson.video_url.split('/').pop()}?autoplay=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeLesson.video_url} controls className="w-full h-full object-contain" />
              )}
            </div>
          )}

          {/* Written Operational Procedure Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1] space-y-3">
              <h4 className="font-bold text-xs text-[#342A29] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#C83E68]" />
                Standard Operating Procedure (SOP)
              </h4>
              <div className="space-y-2">
                {(activeLesson.step_by_step || [
                  'Follow polite opening protocol.',
                  'Verify client requirements clearly.',
                  'Maintain clean record log in partner app.'
                ]).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#342A29]">
                    <span className="w-4 h-4 rounded-full bg-[#133826] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#F5DCE1] space-y-3">
              <h4 className="font-bold text-xs text-[#342A29] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Customer Etiquette & Privacy Standards
              </h4>
              <div className="space-y-2 text-xs text-[#542337]/80">
                {(activeLesson.safety_hygiene || [
                  'Never disclose client personal phone numbers or addresses outside Satguru portal.',
                  'Arrive 5 minutes before scheduled slot; use clean protective shoe covers.',
                  'Escalate any client dispute to admin desk within 15 minutes.'
                ]).map((item, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : selectedCategory ? (
        /* ── CASE 2: CATEGORY EXPLORER VIEW ── */
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#F5DCE1] pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-xl text-xs text-[#542337]/70 hover:text-[#342A29] gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Training Categories
            </Button>
            <Badge className="bg-[#133826] text-white text-xs">
              {selectedCategory.name}
            </Badge>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-4">
            <h3 className="font-serif italic text-2xl font-bold text-[#342A29]">
              {selectedCategory.name}
            </h3>
            <p className="text-xs text-[#542337]/75 max-w-2xl leading-relaxed">
              {selectedCategory.description}
            </p>
          </div>

          {/* Subcategories list */}
          <div className="space-y-4">
            <h4 className="font-serif italic font-bold text-lg text-[#342A29]">
              Modules & Lessons in this Section ({selectedCategory.subcategories.length})
            </h4>

            <div className="space-y-3">
              {selectedCategory.subcategories.map(sub => {
                const totalLes = sub.lessons.length;
                const completedCount = sub.lessons.filter(l => isCompleted(l.id)).length;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5DCE1]/60 pb-3">
                      <div>
                        <h5 className="font-bold text-sm text-[#342A29]">{sub.name}</h5>
                        <p className="text-xs text-[#542337]/70 mt-0.5">{sub.description}</p>
                      </div>
                      <Badge className={completedCount === totalLes && totalLes > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FFF3DC] text-[#B87A24]'}>
                        {completedCount} / {totalLes} Lessons Complete
                      </Badge>
                    </div>

                    {sub.lessons.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-2">
                        Guideline notes for this subcategory will be published in next training batch.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {sub.lessons.map(lesson => {
                          const done = isCompleted(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => { setSelectedSubcategory(sub); setActiveLesson(lesson); }}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                done
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-[#FFFDFB] border-[#F5DCE1] hover:border-[#133826]/40'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#133826] bg-[#133826]/10 px-1.5 py-0.2 rounded">
                                    {lesson.duration_minutes} min
                                  </span>
                                  <h6 className="font-bold text-xs text-[#342A29] truncate">{lesson.title}</h6>
                                </div>
                                <p className="text-[11px] text-[#542337]/70 line-clamp-1">{lesson.description}</p>
                              </div>
                              {done ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[#133826] flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── CASE 3: ALL CATEGORIES GRID VIEW ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif italic font-bold text-lg text-[#342A29]">
              Associate Operational Curricula ({categories.length} Categories)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const subCount = cat.subcategories.length;
              const lessonCount = cat.subcategories.reduce((acc, s) => acc + s.lessons.length, 0);

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="p-5 rounded-3xl bg-white border border-[#F5DCE1] hover:border-[#133826] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
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
                      <span className="text-[10px] font-bold text-[#542337]/50 uppercase tracking-wider">
                        Module #{idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[#342A29] group-hover:text-[#133826] transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-[#542337]/65 line-clamp-2 mt-1">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F5DCE1]/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#133826] bg-[#133826]/10 px-2 py-0.5 rounded-full text-[10px]">
                      {subCount} Subcategories
                    </span>
                    <span className="font-bold text-[#133826] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Module →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

