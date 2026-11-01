import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Upload, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'Poor Service Quality', 'Late Arrival', 'Rude Behavior', 'Wrong Service Delivered',
  'Overcharging', 'Product Allergy / Reaction', 'No Show', 'Unprofessional Conduct',
  'Booking Cancellation Issue', 'Payment Problem', 'Other'
];

export function Complaints() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Pre-fill from URL params (from booking help button)
  const prefillBookingId = searchParams.get('booking') || '';
  const prefillOrderId = searchParams.get('order') || '';
  const prefillName = searchParams.get('against') || '';
  const prefillType = searchParams.get('type') || 'service';

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintNum, setComplaintNum] = useState('');
  const [formData, setFormData] = useState({
    complaint_type: prefillType,
    booking_id: prefillBookingId,
    order_id: prefillOrderId,
    against_name: prefillName,
    category: '',
    description: '',
    priority: 'normal',
  });
  const [files, setFiles] = useState<File[]>([]);

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const path = `complaints/${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage.from('gallery').upload(path, arrayBuffer, { contentType: file.type, upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!formData.category || !formData.description.trim()) {
      toast({ title: 'Fill required fields', description: 'Select category and describe the issue', variant: 'destructive' }); return;
    }
    setLoading(true);
    const imageUrls = await uploadImages();
    const cNum = `CMP${Date.now().toString().slice(-8).toUpperCase()}`;
    const { error } = await supabase.from('complaints').insert({
      user_id: user.id,
      complaint_type: formData.complaint_type,
      booking_id: formData.booking_id || null,
      order_id: formData.order_id || null,
      against_name: formData.against_name || null,
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
      image_urls: imageUrls,
      complaint_number: cNum,
      status: 'open',
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setLoading(false); return; }
    // Notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Complaint Registered',
      message: `Your complaint #${cNum} has been received. We will respond within 24 hours.`,
      type: 'info',
      link: '/profile',
    });
    setComplaintNum(cNum);
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fdf2f8, #f5f3ff)' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complaint Registered!</h2>
        <p className="text-muted-foreground mb-3">Your complaint has been submitted successfully.</p>
        <div className="p-4 bg-white rounded-2xl border border-border mb-6 inline-block">
          <p className="text-sm text-muted-foreground">Complaint ID</p>
          <p className="font-mono font-bold text-lg text-primary">{complaintNum}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-6">We will review and respond within 24–48 hours. You can track status from your Profile → Support section.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/profile')} className="btn-primary">Go to Profile</Button>
          <Button onClick={() => navigate('/')} variant="outline">Home</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf2f8, #f5f3ff, #fef9ee)' }}>
      <main className="section-padding mt-20">
        <div className="container-custom max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold">File a Complaint</h1>
              <p className="text-muted-foreground text-sm">We take every complaint seriously</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-border p-8 space-y-5">
            {/* Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Complaint Against *</label>
              <div className="flex gap-2 flex-wrap">
                {['service', 'stylist', 'associate', 'executive'].map(type => (
                  <button key={type} onClick={() => setFormData(p => ({ ...p, complaint_type: type }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${formData.complaint_type === type ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Booking ID (optional)</label>
                <input value={formData.booking_id} onChange={e => setFormData(p => ({ ...p, booking_id: e.target.value }))}
                  placeholder="e.g. BKG12345" className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Person Name (optional)</label>
                <input value={formData.against_name} onChange={e => setFormData(p => ({ ...p, against_name: e.target.value }))}
                  placeholder="Stylist / Associate name" className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Complaint Category *</label>
              <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="flex gap-2">
                {[['low', 'Low'], ['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']].map(([val, label]) => (
                  <button key={val} onClick={() => setFormData(p => ({ ...p, priority: val }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${formData.priority === val
                      ? val === 'urgent' ? 'bg-red-600 text-white' : val === 'high' ? 'bg-orange-500 text-white' : val === 'normal' ? 'bg-primary text-white' : 'bg-gray-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Describe Your Issue *</label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Please describe the issue in detail. Include date, time, and what happened..." rows={5}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            {/* Images */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Attach Images (optional)</label>
              <input type="file" multiple accept="image/*"
                onChange={e => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              {files.length > 0 && <p className="text-xs text-muted-foreground mt-1">{files.length} file(s) selected</p>}
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="btn-primary w-full h-12 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">We will respond within 24–48 hours. For urgent matters, please call us directly.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
