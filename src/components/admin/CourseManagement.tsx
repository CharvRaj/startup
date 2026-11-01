import { useState, useEffect } from 'react';
import {
  GraduationCap, Users, Sparkles, Plus, Edit2, Trash2, Video, Clock,
  CheckCircle, ChevronRight, ChevronDown, BookOpen, Layers, Award,
  Calendar, Eye, ArrowUpRight, Search, Filter, ShieldCheck, PlayCircle,
  FileText, Scissors, AlertCircle, Save, X, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  trainingService,
  TargetRole,
  CourseCategory,
  CourseSubcategory,
  CourseLesson,
  TrainingAssignment
} from '@/lib/trainingService';

export function CourseManagement() {
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<TargetRole>('stylist');
  const [viewTab, setViewTab] = useState<'content' | 'assignments' | 'employee_progress'>('content');
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<CourseSubcategory | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catThumb, setCatThumb] = useState('');

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<CourseSubcategory | null>(null);
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subThumb, setSubThumb] = useState('');

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDuration, setLessonDuration] = useState(20);
  const [lessonSteps, setLessonSteps] = useState('');
  const [lessonTools, setLessonTools] = useState('');
  const [lessonTips, setLessonTips] = useState('');
  const [lessonHygiene, setLessonHygiene] = useState('');
  const [lessonCare, setLessonCare] = useState('');
  const [lessonPublished, setLessonPublished] = useState(true);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCourseName, setAssignCourseName] = useState('');
  const [assigneeType, setAssigneeType] = useState<'all' | 'individual'>('all');
  const [assignEmpName, setAssignEmpName] = useState('');
  const [assignMandatory, setAssignMandatory] = useState(true);
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignDeadline, setAssignDeadline] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);

  // Video preview dialog
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const loadData = () => {
    const cats = trainingService.getCategories(activeRole);
    setCategories(cats);
    setAssignments(trainingService.getAssignments());

    if (selectedCategory) {
      const updatedCat = cats.find(c => c.id === selectedCategory.id);
      setSelectedCategory(updatedCat || (cats.length > 0 ? cats[0] : null));
    } else if (cats.length > 0) {
      setSelectedCategory(cats[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('satguru:training_updated', handleUpdate);
    return () => window.removeEventListener('satguru:training_updated', handleUpdate);
  }, [activeRole]);

  // Ensure selected subcategory is updated
  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories.length > 0) {
      if (!selectedSubcategory || !selectedCategory.subcategories.some(s => s.id === selectedSubcategory.id)) {
        setSelectedSubcategory(selectedCategory.subcategories[0]);
      } else {
        const updatedSub = selectedCategory.subcategories.find(s => s.id === selectedSubcategory.id);
        setSelectedSubcategory(updatedSub || selectedCategory.subcategories[0]);
      }
    } else {
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  // ── Category Handlers ──
  const handleOpenCatModal = (cat?: CourseCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description);
      setCatThumb(cat.thumbnail);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
      setCatThumb('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80');
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) {
      toast({ title: 'Please enter category name', variant: 'destructive' });
      return;
    }
    if (editingCategory) {
      trainingService.updateCategory(activeRole, editingCategory.id, {
        name: catName.trim(),
        description: catDesc.trim(),
        thumbnail: catThumb.trim(),
      });
      toast({ title: 'Category Updated! ✨' });
    } else {
      const created = trainingService.addCategory(activeRole, {
        name: catName.trim(),
        description: catDesc.trim(),
        thumbnail: catThumb.trim(),
      });
      setSelectedCategory(created);
      toast({ title: 'New Category Added! 🎉' });
    }
    setCategoryModalOpen(false);
    loadData();
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}" and all its subcategories & lessons?`)) {
      trainingService.deleteCategory(activeRole, catId);
      toast({ title: 'Category Deleted' });
      loadData();
    }
  };

  // ── Subcategory Handlers ──
  const handleOpenSubModal = (sub?: CourseSubcategory) => {
    if (!selectedCategory) {
      toast({ title: 'Select a category first', variant: 'destructive' });
      return;
    }
    if (sub) {
      setEditingSub(sub);
      setSubName(sub.name);
      setSubDesc(sub.description);
      setSubThumb(sub.thumbnail);
    } else {
      setEditingSub(null);
      setSubName('');
      setSubDesc('');
      setSubThumb(selectedCategory.thumbnail || '');
    }
    setSubModalOpen(true);
  };

  const handleSaveSubcategory = () => {
    if (!selectedCategory) return;
    if (!subName.trim()) {
      toast({ title: 'Enter subcategory name', variant: 'destructive' });
      return;
    }
    if (editingSub) {
      trainingService.updateSubcategory(activeRole, selectedCategory.id, editingSub.id, {
        name: subName.trim(),
        description: subDesc.trim(),
        thumbnail: subThumb.trim(),
      });
      toast({ title: 'Subcategory Updated! ✨' });
    } else {
      const created = trainingService.addSubcategory(activeRole, selectedCategory.id, {
        name: subName.trim(),
        description: subDesc.trim(),
        thumbnail: subThumb.trim(),
      });
      setSelectedSubcategory(created);
      toast({ title: 'Subcategory Created! 🎉' });
    }
    setSubModalOpen(false);
    loadData();
  };

  const handleDeleteSubcategory = (subId: string, name: string) => {
    if (!selectedCategory) return;
    if (confirm(`Delete subcategory "${name}"?`)) {
      trainingService.deleteSubcategory(activeRole, selectedCategory.id, subId);
      toast({ title: 'Subcategory Deleted' });
      loadData();
    }
  };

  // ── Lesson Handlers ──
  const handleOpenLessonModal = (lesson?: CourseLesson) => {
    if (!selectedCategory || !selectedSubcategory) {
      toast({ title: 'Select category and subcategory first', variant: 'destructive' });
      return;
    }
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDesc(lesson.description);
      setLessonVideo(lesson.video_url);
      setLessonDuration(lesson.duration_minutes || 20);
      setLessonSteps((lesson.step_by_step || []).join('\n'));
      setLessonTools((lesson.required_tools || []).join('\n'));
      setLessonTips((lesson.important_tips || []).join('\n'));
      setLessonHygiene((lesson.safety_hygiene || []).join('\n'));
      setLessonCare((lesson.before_after_care || []).join('\n'));
      setLessonPublished(lesson.is_published ?? true);
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonDesc('');
      setLessonVideo('https://www.youtube.com/watch?v=kJQP7kiw5Fk');
      setLessonDuration(20);
      setLessonSteps('');
      setLessonTools('');
      setLessonTips('');
      setLessonHygiene('');
      setLessonCare('');
      setLessonPublished(true);
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (!lessonTitle.trim()) {
      toast({ title: 'Enter lesson title', variant: 'destructive' });
      return;
    }
    const steps = lessonSteps.split('\n').map(s => s.trim()).filter(Boolean);
    const tools = lessonTools.split('\n').map(s => s.trim()).filter(Boolean);
    const tips = lessonTips.split('\n').map(s => s.trim()).filter(Boolean);
    const hygiene = lessonHygiene.split('\n').map(s => s.trim()).filter(Boolean);
    const care = lessonCare.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      title: lessonTitle.trim(),
      description: lessonDesc.trim(),
      video_url: lessonVideo.trim() || 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      duration_minutes: Number(lessonDuration) || 15,
      step_by_step: steps,
      required_tools: tools,
      important_tips: tips,
      safety_hygiene: hygiene,
      before_after_care: care,
      is_published: lessonPublished,
    };

    if (editingLesson) {
      trainingService.updateLesson(activeRole, selectedCategory.id, selectedSubcategory.id, editingLesson.id, payload);
      toast({ title: 'Lesson Updated! 🎬' });
    } else {
      trainingService.addLesson(activeRole, selectedCategory.id, selectedSubcategory.id, payload);
      toast({ title: 'Lesson Published! 🎉' });
    }
    setLessonModalOpen(false);
    loadData();
  };

  const handleDeleteLesson = (lessonId: string, title: string) => {
    if (!selectedCategory || !selectedSubcategory) return;
    if (confirm(`Delete lesson "${title}"?`)) {
      trainingService.deleteLesson(activeRole, selectedCategory.id, selectedSubcategory.id, lessonId);
      toast({ title: 'Lesson Removed' });
      loadData();
    }
  };

  // ── Assignment Handlers ──
  const handleCreateAssignment = () => {
    if (!assignCourseName.trim()) {
      toast({ title: 'Please provide course name', variant: 'destructive' });
      return;
    }
    trainingService.addAssignment({
      role: activeRole,
      course_name: assignCourseName.trim(),
      assignee_type: assigneeType,
      employee_name: assigneeType === 'individual' ? assignEmpName.trim() : undefined,
      is_mandatory: assignMandatory,
      start_date: assignStartDate,
      deadline: assignDeadline,
    });
    toast({ title: 'Training Assigned Successfully! 📋', description: `Assigned to ${assigneeType === 'all' ? 'All ' + activeRole + 's' : assignEmpName}` });
    setAssignModalOpen(false);
    loadData();
  };

  const totalLessonsCount = categories.reduce((sum, c) => sum + c.subcategories.reduce((s2, sub) => s2 + sub.lessons.length, 0), 0);
  const totalSubcategoriesCount = categories.reduce((sum, c) => sum + c.subcategories.length, 0);

  return (
    <div className="space-y-6 antialiased">
      {/* ── TOP HEADER & ROLE SWITCHER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FDF0F4] to-[#FFF3DC] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] shadow-xs">
            <GraduationCap className="w-6 h-6 text-[#C83E68]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif italic text-2xl font-bold text-[#342A29]">
                Course & Staff Training Academy
              </h2>
              <Badge className="bg-[#133826] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Staff LMS
              </Badge>
            </div>
            <p className="text-xs text-[#542337]/70 mt-0.5">
              Control training curricula, video lessons, procedures, and staff assignments for BlindGlow by Satguru.
            </p>
          </div>
        </div>

        {/* ── TWO INDEPENDENT ACADEMY SECTIONS ── */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1] gap-1 shadow-inner">
          <button
            onClick={() => setActiveRole('stylist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'stylist'
                ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white shadow-md'
                : 'text-[#542337]/70 hover:text-[#342A29] hover:bg-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            Stylist Training Management
          </button>
          <button
            onClick={() => setActiveRole('associate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'associate'
                ? 'bg-gradient-to-r from-[#133826] to-[#0d261a] text-white shadow-md'
                : 'text-[#542337]/70 hover:text-[#342A29] hover:bg-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Associate Training Management
          </button>
        </div>
      </div>

      {/* ── METRICS OVERVIEW STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#542337]/60">Categories</p>
            <p className="text-2xl font-serif font-bold text-[#342A29] mt-0.5">{categories.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDF0F4] text-[#C83E68] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#542337]/60">Subcategories</p>
            <p className="text-2xl font-serif font-bold text-[#342A29] mt-0.5">{totalSubcategoriesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF3DC] text-[#B87A24] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#542337]/60">Video Lessons</p>
            <p className="text-2xl font-serif font-bold text-[#342A29] mt-0.5">{totalLessonsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#542337]/60">Active Assignments</p>
            <p className="text-2xl font-serif font-bold text-[#342A29] mt-0.5">
              {assignments.filter(a => a.role === activeRole).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── SUB-TABS: CONTENT TREE VS ASSIGNMENTS ── */}
      <div className="flex items-center justify-between gap-4 border-b border-[#F5DCE1] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'content'
                ? 'bg-white text-[#C83E68] border border-[#F5DCE1] shadow-xs'
                : 'text-[#542337]/70 hover:text-[#342A29]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Curriculum Hierarchy (Course → Category → Subcategory → Lessons)
          </button>
          <button
            onClick={() => setViewTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'assignments'
                ? 'bg-white text-[#C83E68] border border-[#F5DCE1] shadow-xs'
                : 'text-[#542337]/70 hover:text-[#342A29]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Course Assignment & Deadlines ({assignments.filter(a => a.role === activeRole).length})
          </button>
          <button
            onClick={() => setViewTab('employee_progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'employee_progress'
                ? 'bg-white text-[#C83E68] border border-[#F5DCE1] shadow-xs'
                : 'text-[#542337]/70 hover:text-[#342A29]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Staff Completion Monitor
          </button>
        </div>

        {viewTab === 'content' && (
          <Button
            onClick={() => handleOpenCatModal()}
            size="sm"
            className="rounded-xl bg-[#C83E68] hover:bg-[#A82E52] text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Category
          </Button>
        )}
        {viewTab === 'assignments' && (
          <Button
            onClick={() => setAssignModalOpen(true)}
            size="sm"
            className="rounded-xl bg-[#133826] hover:bg-[#0c2419] text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Course to Staff
          </Button>
        )}
      </div>

      {/* ── VIEW TAB 1: CURRICULUM HIERARCHY ── */}
      {viewTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT PANE: CATEGORIES LIST ── */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-serif italic font-bold text-sm text-[#342A29]">
                {activeRole === 'stylist' ? 'Stylist Service Categories' : 'Associate Training Modules'} ({categories.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory?.id === cat.id;
                const totalSub = cat.subcategories.length;
                const totalLes = cat.subcategories.reduce((acc, s) => acc + s.lessons.length, 0);

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat.subcategories.length > 0) setSelectedSubcategory(cat.subcategories[0]);
                      else setSelectedSubcategory(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-[#C83E68] shadow-md ring-1 ring-[#C83E68]/20'
                        : 'bg-[#FFFDFB] border-[#F5DCE1]/80 hover:bg-white hover:border-[#C83E68]/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <img src={cat.thumbnail} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#542337]/50 uppercase tracking-wider">#{idx + 1}</span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }}
                            className="p-1 hover:text-[#C83E68] rounded-md transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                            className="p-1 hover:text-red-600 rounded-md transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-[#342A29] truncate">{cat.name}</h4>
                      <p className="text-[11px] text-[#542337]/65 line-clamp-1 mt-0.5">{cat.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF3DC] text-[#B87A24] font-semibold">
                          {totalSub} subcategories
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                          {totalLes} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANE: SUBCATEGORIES & LESSONS EXPLORER ── */}
          <div className="lg:col-span-8 space-y-5">
            {selectedCategory ? (
              <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-sm space-y-6">
                {/* Active Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5DCE1] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif italic text-xl font-bold text-[#342A29]">
                        {selectedCategory.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] border-[#F5DCE1] text-[#C83E68]">
                        Category Details
                      </Badge>
                    </div>
                    <p className="text-xs text-[#542337]/70 mt-1 max-w-xl">{selectedCategory.description}</p>
                  </div>
                  <Button
                    onClick={() => handleOpenSubModal()}
                    size="sm"
                    className="rounded-xl bg-[#FFF3DC] hover:bg-[#ffe9c2] text-[#B87A24] font-bold text-xs gap-1.5 self-start sm:self-auto border border-[#B87A24]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subcategory
                  </Button>
                </div>

                {/* Subcategories Horizontal Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#542337]/60">
                      Subcategories ({selectedCategory.subcategories.length})
                    </span>
                  </div>

                  {selectedCategory.subcategories.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#FFF9F5] border border-dashed border-[#F5DCE1] text-center">
                      <p className="text-xs text-[#542337]/60">No subcategories created yet.</p>
                      <Button
                        onClick={() => handleOpenSubModal()}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs rounded-xl border-[#F5DCE1]"
                      >
                        + Add First Subcategory
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                      {selectedCategory.subcategories.map((sub) => {
                        const isSubActive = selectedSubcategory?.id === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer flex-shrink-0 flex items-center gap-2.5 ${
                              isSubActive
                                ? 'bg-gradient-to-r from-[#C83E68] to-[#A82E52] text-white border-transparent shadow-md'
                                : 'bg-[#FFFDFB] border-[#F5DCE1] text-[#342A29] hover:bg-white'
                            }`}
                          >
                            <span className="text-xs font-bold whitespace-nowrap">{sub.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSubActive ? 'bg-white/20 text-white' : 'bg-[#FFF3DC] text-[#B87A24]'
                            }`}>
                              {sub.lessons.length}
                            </span>
                            <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenSubModal(sub)}
                                className={`p-0.5 rounded hover:opacity-100 opacity-70 ${isSubActive ? 'text-white' : 'text-[#542337]/70'}`}
                                title="Edit"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                className={`p-0.5 rounded hover:opacity-100 opacity-70 ${isSubActive ? 'text-white' : 'text-red-600'}`}
                                title="Delete"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subcategory Details & Lessons Section */}
                {selectedSubcategory && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-t border-[#F5DCE1] pt-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#342A29] flex items-center gap-2">
                          <span>{selectedSubcategory.name}</span>
                          <span className="text-xs font-normal text-[#542337]/60">
                            • {selectedSubcategory.lessons.length} Lessons Available
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#542337]/70 mt-0.5">{selectedSubcategory.description}</p>
                      </div>
                      <Button
                        onClick={() => handleOpenLessonModal()}
                        size="sm"
                        className="rounded-xl bg-[#C83E68] hover:bg-[#A82E52] text-white font-bold text-xs gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson / Video
                      </Button>
                    </div>

                    {/* Lessons Grid / List */}
                    {selectedSubcategory.lessons.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#FFF9F5] border border-dashed border-[#F5DCE1] text-center space-y-2">
                        <Video className="w-8 h-8 mx-auto text-[#C83E68]/50" />
                        <p className="text-xs font-semibold text-[#342A29]">No Lessons Added Yet</p>
                        <p className="text-[11px] text-[#542337]/60 max-w-sm mx-auto">
                          Add step-by-step videos, instructions, required tools, and before/aftercare notes for this subcategory.
                        </p>
                        <Button
                          onClick={() => handleOpenLessonModal()}
                          size="sm"
                          className="rounded-xl bg-[#C83E68] text-white text-xs mt-2"
                        >
                          + Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedSubcategory.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#F5DCE1] hover:border-[#C83E68]/40 hover:shadow-xs transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                  onClick={() => setPreviewVideoUrl(lesson.video_url)}
                                  className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-100 to-rose-100 border border-purple-200 flex items-center justify-center text-purple-700 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                                  title="Click to preview video"
                                >
                                  <PlayCircle className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#FDF0F4] text-[#C83E68]">
                                      Lesson #{lIdx + 1}
                                    </span>
                                    <h5 className="font-bold text-xs text-[#342A29]">{lesson.title}</h5>
                                    {lesson.is_published ? (
                                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                                        Published
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] text-stone-500">
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#542337]/70 mt-1 line-clamp-2 leading-relaxed">
                                    {lesson.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[#542337]/70 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} min
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenLessonModal(lesson)}
                                  className="h-8 px-2 text-xs hover:text-[#C83E68]"
                                >
                                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Lesson Highlights Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#F5DCE1]/60 text-[11px]">
                              <div className="p-2 rounded-xl bg-white border border-[#F5DCE1]/60">
                                <span className="font-bold text-[#342A29] block mb-0.5">Step-by-Step ({lesson.step_by_step?.length || 0})</span>
                                <p className="text-[#542337]/70 truncate">
                                  {lesson.step_by_step?.[0] || 'No steps outlined'}
                                </p>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-[#F5DCE1]/60">
                                <span className="font-bold text-[#342A29] block mb-0.5">Required Tools ({lesson.required_tools?.length || 0})</span>
                                <p className="text-[#542337]/70 truncate">
                                  {lesson.required_tools?.join(', ') || 'Standard salon kit'}
                                </p>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-[#F5DCE1]/60">
                                <span className="font-bold text-[#342A29] block mb-0.5">Hygiene / Safety</span>
                                <p className="text-[#542337]/70 truncate">
                                  {lesson.safety_hygiene?.[0] || 'Sanitized tools & disposable apron'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#F5DCE1]">
                <p className="text-xs text-stone-500">Select a category on the left to inspect its curriculum.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW TAB 2: COURSE ASSIGNMENTS ── */}
      {viewTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif italic text-lg font-bold text-[#342A29]">
                Staff Assignments & Deadlines ({activeRole === 'stylist' ? 'Stylists' : 'Associates'})
              </h3>
              <p className="text-xs text-[#542337]/70">
                Track mandatory compliance deadlines and employee-wise completion.
              </p>
            </div>
            <Button
              onClick={() => setAssignModalOpen(true)}
              size="sm"
              className="rounded-xl bg-[#133826] hover:bg-[#0c2419] text-white font-bold text-xs gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Assignment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.filter(a => a.role === activeRole).map(assign => (
              <div
                key={assign.id}
                className="p-5 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge className={assign.is_mandatory ? 'bg-rose-100 text-rose-800 border-rose-200 text-[10px]' : 'bg-stone-100 text-stone-700 text-[10px]'}>
                      {assign.is_mandatory ? 'Mandatory Training' : 'Optional Upgrade'}
                    </Badge>
                    <h4 className="font-bold text-sm text-[#342A29] leading-snug">{assign.course_name}</h4>
                  </div>
                  <button
                    onClick={() => trainingService.deleteAssignment(assign.id)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#542337]/80 bg-[#FFF9F5] p-3 rounded-2xl border border-[#F5DCE1]/60">
                  <div className="flex justify-between">
                    <span className="text-[#542337]/60">Target Staff:</span>
                    <span className="font-bold text-[#342A29]">
                      {assign.assignee_type === 'all' ? `All Active ${activeRole.toUpperCase()}s` : assign.employee_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#542337]/60">Start Date:</span>
                    <span className="font-medium text-[#342A29]">{assign.start_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#542337]/60">Completion Deadline:</span>
                    <span className="font-bold text-[#C83E68]">{assign.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#542337]/70 pt-1">
                  <span>Assigned On: {new Date(assign.created_at).toLocaleDateString('en-IN')}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active Cycle
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW TAB 3: STAFF COMPLETION MONITOR ── */}
      {viewTab === 'employee_progress' && (
        <div className="p-6 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif italic text-lg font-bold text-[#342A29]">
                Live Staff Onboarding & Training Progress
              </h3>
              <p className="text-xs text-[#542337]/70">
                Monitor individual completion percentages, finished lessons, and certified staff.
              </p>
            </div>
            <Badge className="bg-[#133826] text-white text-xs">
              Live Progress Synced
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F5DCE1] text-left text-[11px] font-bold text-[#542337]/60 uppercase tracking-wider">
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Completed Lessons</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE1]/60">
                {[
                  { name: 'Priya Sharma', role: 'stylist', completed: 8, total: 10, cert: 'Certified' },
                  { name: 'Radha Verma', role: 'stylist', completed: 5, total: 10, cert: 'In Training' },
                  { name: 'Ananya Sen', role: 'stylist', completed: 10, total: 10, cert: 'Certified Master' },
                  { name: 'Kavya Singhania', role: 'associate', completed: 4, total: 6, cert: 'Compliance In-Progress' },
                  { name: 'Amit Kumar', role: 'associate', completed: 6, total: 6, cert: 'Certified Associate' },
                ].filter(e => e.role === activeRole).map((emp, i) => {
                  const pct = Math.round((emp.completed / emp.total) * 100);
                  return (
                    <tr key={i} className="hover:bg-[#FFF9F5]/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#342A29]">{emp.name}</td>
                      <td className="py-3.5 px-3 uppercase text-[10px] font-semibold text-[#542337]/70">{emp.role}</td>
                      <td className="py-3.5 px-3 font-semibold text-[#342A29]">{emp.completed} / {emp.total} Lessons</td>
                      <td className="py-3.5 px-3">
                        <div className="w-36 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[#C83E68]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-bold text-[10px] text-[#342A29]">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge className={pct === 100 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {emp.cert}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] rounded-lg border-[#F5DCE1] hover:bg-[#FDF0F4]"
                          onClick={() => toast({ title: `Detailed report for ${emp.name}`, description: `Completion: ${pct}% across all assigned modules.` })}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD/EDIT CATEGORY ── */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl font-bold text-[#342A29]">
              {editingCategory ? 'Edit Category' : 'Create New Training Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Category Name *
              </label>
              <Input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="e.g. Hair Services / Customer Handling"
                className="rounded-xl border-[#F5DCE1]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Description
              </label>
              <textarea
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Brief summary of what this training category covers..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden focus:ring-1 focus:ring-[#C83E68]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Thumbnail Image URL
              </label>
              <Input
                value={catThumb}
                onChange={e => setCatThumb(e.target.value)}
                placeholder="https://..."
                className="rounded-xl border-[#F5DCE1]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCategoryModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="rounded-xl bg-[#C83E68] text-white font-bold text-xs">
                Save Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: ADD/EDIT SUBCATEGORY ── */}
      <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl font-bold text-[#342A29]">
              {editingSub ? 'Edit Subcategory' : `Add Subcategory to "${selectedCategory?.name}"`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Subcategory Title *
              </label>
              <Input
                value={subName}
                onChange={e => setSubName(e.target.value)}
                placeholder="e.g. Hair Cutting / Handling Delays"
                className="rounded-xl border-[#F5DCE1]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Description
              </label>
              <textarea
                value={subDesc}
                onChange={e => setSubDesc(e.target.value)}
                placeholder="Detailed objectives and scope of this subcategory..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden focus:ring-1 focus:ring-[#C83E68]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Thumbnail URL
              </label>
              <Input
                value={subThumb}
                onChange={e => setSubThumb(e.target.value)}
                placeholder="https://..."
                className="rounded-xl border-[#F5DCE1]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSubModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveSubcategory} className="rounded-xl bg-[#C83E68] text-white font-bold text-xs">
                Save Subcategory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: ADD/EDIT LESSON (WITH FULL INSTRUCTIONS & VIDEO) ── */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl font-bold text-[#342A29]">
              {editingLesson ? 'Edit Training Lesson' : `Publish Lesson in "${selectedSubcategory?.name}"`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Lesson Title *
                </label>
                <Input
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  placeholder="e.g. Layer Cut: Sectioning, 90° Elevation & Texture Blending"
                  className="rounded-xl border-[#F5DCE1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Video URL (YouTube / Vimeo / MP4) *
                </label>
                <Input
                  value={lessonVideo}
                  onChange={e => setLessonVideo(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="rounded-xl border-[#F5DCE1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Estimated Duration (Minutes)
                </label>
                <Input
                  type="number"
                  value={lessonDuration}
                  onChange={e => setLessonDuration(Number(e.target.value))}
                  className="rounded-xl border-[#F5DCE1]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Lesson Overview & Concept
              </label>
              <textarea
                value={lessonDesc}
                onChange={e => setLessonDesc(e.target.value)}
                placeholder="Explain the importance of this technique or procedure..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Step-by-Step Instructions (one per line)
              </label>
              <textarea
                value={lessonSteps}
                onChange={e => setLessonSteps(e.target.value)}
                placeholder="1. Sanitize hands and prep client cape...&#10;2. Create 4-quadrant parting...&#10;3. Cut perimeter guideline at 0 degrees..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Required Tools & Products (one per line)
                </label>
                <textarea
                  value={lessonTools}
                  onChange={e => setLessonTools(e.target.value)}
                  placeholder="Japanese 6.0 Shears&#10;Carbon Tail Comb&#10;Thermal Round Brush"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Important Tips & Pro Hacks
                </label>
                <textarea
                  value={lessonTips}
                  onChange={e => setLessonTips(e.target.value)}
                  placeholder="Check tension consistently&#10;Never cut above chin on first tier"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Safety & Hygiene Protocols
                </label>
                <textarea
                  value={lessonHygiene}
                  onChange={e => setLessonHygiene(e.target.value)}
                  placeholder="Barbicide sterilization&#10;Disposable apron only"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Before & Aftercare Instructions
                </label>
                <textarea
                  value={lessonCare}
                  onChange={e => setLessonCare(e.target.value)}
                  placeholder="Before: Skin allergy consultation&#10;After: Argan oil serum application"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#F5DCE1] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="publishCheckbox"
                checked={lessonPublished}
                onChange={e => setLessonPublished(e.target.checked)}
                className="w-4 h-4 rounded-md accent-[#C83E68]"
              />
              <label htmlFor="publishCheckbox" className="text-xs font-bold text-[#342A29]">
                Publish immediately to Staff Dashboards
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#F5DCE1]">
              <Button variant="ghost" onClick={() => setLessonModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={handleSaveLesson} className="rounded-xl bg-[#C83E68] text-white font-bold text-xs gap-1.5 shadow-md">
                <Save className="w-3.5 h-3.5" />
                Save & Publish Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: ASSIGN COURSE ── */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl font-bold text-[#342A29]">
              Assign Course to Staff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Course / Certification Title *
              </label>
              <Input
                value={assignCourseName}
                onChange={e => setAssignCourseName(e.target.value)}
                placeholder="e.g. Master Bridal Makeup & Etiquette 2026"
                className="rounded-xl border-[#F5DCE1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                Assignee Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssigneeType('all')}
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    assigneeType === 'all'
                      ? 'bg-[#133826] text-white border-transparent'
                      : 'bg-stone-50 border-[#F5DCE1] text-[#342A29]'
                  }`}
                >
                  All {activeRole.toUpperCase()}s
                </button>
                <button
                  type="button"
                  onClick={() => setAssigneeType('individual')}
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    assigneeType === 'individual'
                      ? 'bg-[#133826] text-white border-transparent'
                      : 'bg-stone-50 border-[#F5DCE1] text-[#342A29]'
                  }`}
                >
                  Single Employee
                </button>
              </div>
            </div>

            {assigneeType === 'individual' && (
              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Employee Full Name *
                </label>
                <Input
                  value={assignEmpName}
                  onChange={e => setAssignEmpName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="rounded-xl border-[#F5DCE1]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={assignStartDate}
                  onChange={e => setAssignStartDate(e.target.value)}
                  className="rounded-xl border-[#F5DCE1] text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider block mb-1">
                  Deadline Date
                </label>
                <Input
                  type="date"
                  value={assignDeadline}
                  onChange={e => setAssignDeadline(e.target.value)}
                  className="rounded-xl border-[#F5DCE1] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="mandCheck"
                checked={assignMandatory}
                onChange={e => setAssignMandatory(e.target.checked)}
                className="w-4 h-4 rounded-md accent-[#C83E68]"
              />
              <label htmlFor="mandCheck" className="text-xs font-bold text-[#342A29]">
                Mandatory for service eligibility
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="ghost" onClick={() => setAssignModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} className="rounded-xl bg-[#133826] text-white font-bold text-xs">
                Assign Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 5: VIDEO PREVIEW PLAYER ── */}
      <Dialog open={!!previewVideoUrl} onOpenChange={(o) => !o && setPreviewVideoUrl(null)}>
        <DialogContent className="max-w-3xl bg-black text-white rounded-3xl p-4 overflow-hidden border border-white/10">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
            {previewVideoUrl?.includes('youtube.com') || previewVideoUrl?.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoUrl.includes('v=') ? previewVideoUrl.split('v=')[1]?.split('&')[0] : previewVideoUrl.split('/').pop()}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={previewVideoUrl || ''} controls autoPlay className="w-full h-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

