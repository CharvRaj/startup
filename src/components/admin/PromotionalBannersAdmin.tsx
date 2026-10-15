import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Power, MoveUp, MoveDown, Eye,
  Calendar, Link as LinkIcon, Image as ImageIcon, CheckCircle,
  AlertTriangle, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  PromotionalBanner,
  PRESET_BANNER_IMAGES,
  fetchAllAdminBanners,
  createPromotionalBanner,
  updatePromotionalBanner,
  deletePromotionalBanner,
  toggleBannerStatus,
  moveBannerOrder,
} from '@/lib/banners';

export function PromotionalBannersAdmin() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create Modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '/images/larana-glow-refresh.png',
    ctaLabel: 'Explore Treatment',
    ctaLink: '/doorstep-service',
    badge: 'Special Offer',
    status: 'active' as 'active' | 'inactive',
    startAt: '',
    endAt: '',
    displayOrder: 1,
  });

  // Live Preview modal
  const [previewBanner, setPreviewBanner] = useState<PromotionalBanner | null>(null);

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAdminBanners();
      setBanners(data);
    } catch (e: any) {
      toast({ title: 'Error loading banners', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '/images/larana-glow-refresh.png',
      ctaLabel: 'Book Now',
      ctaLink: '/doorstep-service',
      badge: 'Glow & Refresh',
      status: 'active',
      startAt: '',
      endAt: '',
      displayOrder: banners.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (b: PromotionalBanner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      ctaLabel: b.ctaLabel || 'Book Now',
      ctaLink: b.ctaLink || '/doorstep-service',
      badge: b.badge || '',
      status: b.status,
      startAt: b.startAt ? b.startAt.split('T')[0] : '',
      endAt: b.endAt ? b.endAt.split('T')[0] : '',
      displayOrder: b.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Validation Error', description: 'Banner title is required', variant: 'destructive' });
      return;
    }

    try {
      if (editingBanner) {
        await updatePromotionalBanner(editingBanner.id, {
          title: formData.title,
          subtitle: formData.subtitle,
          imageUrl: formData.imageUrl,
          ctaLabel: formData.ctaLabel,
          ctaLink: formData.ctaLink,
          badge: formData.badge,
          status: formData.status,
          startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
          endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
          displayOrder: Number(formData.displayOrder) || editingBanner.displayOrder,
        });
        toast({ title: 'Banner Updated ✅', description: `"${formData.title}" was saved successfully.` });
      } else {
        await createPromotionalBanner({
          title: formData.title,
          subtitle: formData.subtitle,
          imageUrl: formData.imageUrl,
          ctaLabel: formData.ctaLabel,
          ctaLink: formData.ctaLink,
          badge: formData.badge,
          status: formData.status,
          startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
          endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
          displayOrder: Number(formData.displayOrder) || banners.length + 1,
        });
        toast({ title: 'Banner Created 🎉', description: `New promotional banner published.` });
      }
      setDialogOpen(false);
      loadBanners();
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleBannerStatus(id);
      toast({
        title: updated.status === 'active' ? '🟢 Banner Activated' : '⚪ Banner Deactivated',
        description: `Status changed to ${updated.status}. Customer homepage updated.`,
      });
      loadBanners();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    try {
      const updated = await moveBannerOrder(id, direction);
      setBanners(updated);
      toast({ title: 'Order Updated ↕️', description: 'Banner display sequence updated.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotionalBanner(id);
      setDeleteConfirmId(null);
      toast({ title: 'Banner Deleted 🗑️', description: 'The promotional banner was removed.' });
      loadBanners();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Promotional Banners Manager
            </h2>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Homepage Carousel
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage the three visible promotional banners displayed on the Larana customer homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadBanners}
            variant="outline"
            size="sm"
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={openCreateDialog}
            className="btn-primary text-xs h-9 gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Promotional Banner
          </Button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-sm text-foreground">No Promotional Banners Found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add your first promotional card to appear in the customer carousel.
            </p>
            <Button onClick={openCreateDialog} size="sm" className="btn-primary text-xs">
              + Add First Banner
            </Button>
          </Card>
        ) : (
          banners.map((banner, index) => (
            <Card
              key={banner.id}
              className={`border transition-all duration-200 overflow-hidden ${
                banner.status === 'active' ? 'border-border/80 bg-card' : 'border-border/40 bg-muted/30 opacity-75'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                
                {/* Left Info with Thumbnail */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Order indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMove(banner.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                      #{banner.displayOrder}
                    </span>
                    <button
                      onClick={() => handleMove(banner.id, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-border/60 bg-muted flex-shrink-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    {banner.badge && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/70 text-white">
                        {banner.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {banner.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          banner.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {banner.status === 'active' ? '● Active' : '○ Inactive'}
                      </Badge>
                      {banner.ctaLink && (
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5" />
                          {banner.ctaLink}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                      {banner.subtitle}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>CTA: <strong className="text-foreground">{banner.ctaLabel || 'None'}</strong></span>
                      {banner.startAt && (
                        <span>Valid from: {new Date(banner.startAt).toLocaleDateString()}</span>
                      )}
                      {banner.endAt && (
                        <span>To: {new Date(banner.endAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  <Button
                    onClick={() => setPreviewBanner(banner)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    title="Live Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </Button>

                  <Button
                    onClick={() => handleToggle(banner.id)}
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs gap-1 ${
                      banner.status === 'active' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                    title={banner.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {banner.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>

                  <Button
                    onClick={() => openEditDialog(banner)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>

                  <Button
                    onClick={() => setDeleteConfirmId(banner.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit / Create Banner Modal */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDialogOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
              <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {editingBanner ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
              </h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    Banner Heading <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Glow & Refresh Ritual"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    Promotional Label / Badge
                  </label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Glow & Refresh, 40% OFF"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  Supporting Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Short, persuasive copy describing the treatment package..."
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Image Picker */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  Banner Image URL or Preset
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/images/larana-glow-refresh.png or https://..."
                    className="h-9 text-xs flex-1"
                  />
                </div>

                {/* Preset image suggestions */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Or pick a studio preset image:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNER_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          formData.imageUrl === preset.url
                            ? 'bg-primary text-white border-primary'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground border-border/60'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="mt-3 relative h-28 w-full rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* CTA Label & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-foreground">CTA Label</label>
                  <Input
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    placeholder="e.g. Explore Facials, Book Now"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">CTA Destination Link</label>
                  <Input
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="/doorstep-service or /#services"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Validity Dates & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">Display Order</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="pt-2 flex items-center gap-4">
                <label className="font-bold text-foreground">Status:</label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                  />
                  <span className="text-emerald-600 font-semibold">Active (Publish)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                  />
                  <span className="text-muted-foreground font-semibold">Inactive (Draft)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border/70 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary h-9 text-xs gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {editingBanner ? 'Save Changes' : 'Publish Banner'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden border shadow-2xl bg-white text-left"
            style={{ borderColor: '#E6DDDA' }}
          >
            <div className="p-3 bg-[#FFF8ED] border-b border-[#E6DDDA] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8C6754] uppercase tracking-wider">
                Homepage Carousel Card Preview
              </span>
              <button
                onClick={() => setPreviewBanner(null)}
                className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-[#2D1F1D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FFF8ED]">
              <img
                src={previewBanner.imageUrl}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
              />
              {previewBanner.badge && (
                <div
                  className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shadow-xs backdrop-blur-md"
                  style={{
                    background: 'rgba(255, 248, 237, 0.95)',
                    color: '#4A3B32',
                    border: '1px solid rgba(199, 178, 153, 0.5)',
                  }}
                >
                  {previewBanner.badge}
                </div>
              )}
            </div>

            <div className="p-5">
              <h3
                className="text-lg font-bold mb-1.5"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#2D1F1D',
                }}
              >
                {previewBanner.title}
              </h3>
              <p className="text-xs text-[#5A4A42] leading-relaxed mb-4 line-clamp-2">
                {previewBanner.subtitle}
              </p>
              <div className="pt-3 border-t border-[#E6DDDA]/60 flex items-center justify-between text-xs font-semibold text-[#8C6754]">
                <span>{previewBanner.ctaLabel || 'Discover More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Delete Promotional Banner?</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Are you sure you want to delete this promotional banner? It will immediately disappear from the customer homepage carousel.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Delete Banner
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
