// adService.ts - Service for managing and serving Super Admin Advertisements

export interface AdItem {
  id: string;
  title: string;
  titleMl?: string;
  description?: string;
  descriptionMl?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string; // Base64 data URL or external URL (images/videos under 50MB)
  fileName?: string;
  fileSizeMb?: number;
  linkUrl?: string;
  ctaText?: string;
  ctaTextMl?: string;
  active: boolean;
  durationSeconds?: number; // 10s for images, or video duration
  createdAt: number;
  viewsCount: number;
  clicksCount: number;
}

const STORAGE_KEY = 'vinyasa_superadmin_ads_v1';

// Initial default ads list is completely empty - only admin-uploaded ads will be shown
const DEFAULT_ADS: AdItem[] = [];

class AdService {
  private ads: AdItem[] = [];
  private listeners: Array<(ads: AdItem[]) => void> = [];

  constructor() {
    this.loadAds();
  }

  private loadAds() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AdItem[] = JSON.parse(stored);
        // Filter out legacy hardcoded sample/mock ads if any existed from previous versions
        const cleaned = parsed.filter(
          (a) => a.id !== 'ad-vinyasa-pro' && a.id !== 'ad-green-building'
        );
        this.ads = cleaned;
        if (cleaned.length !== parsed.length) {
          this.saveToStorage();
        }
      } else {
        this.ads = [];
      }
    } catch {
      this.ads = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ads));
      this.notify();
    } catch (e) {
      console.error('[AdService] Failed to save ads to storage:', e);
    }
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.getAds());
      } catch (err) {
        console.error('[AdService] Listener error:', err);
      }
    });
  }

  public subscribe(listener: (ads: AdItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getAds());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getAds(): AdItem[] {
    return [...this.ads];
  }

  public getActiveAds(): AdItem[] {
    return this.ads.filter((a) => a.active);
  }

  public addAd(ad: Omit<AdItem, 'id' | 'createdAt' | 'viewsCount' | 'clicksCount'>): AdItem {
    const newAd: AdItem = {
      ...ad,
      id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      viewsCount: 0,
      clicksCount: 0,
      active: true,
      durationSeconds: ad.mediaType === 'image' ? 10 : (ad.durationSeconds || 30),
    };
    this.ads.unshift(newAd);
    this.saveToStorage();
    return newAd;
  }

  public updateAd(id: string, updates: Partial<AdItem>): AdItem | null {
    const idx紧 = this.ads.findIndex((a) => a.id === id);
    if (idx紧 === -1) return null;
    this.ads[idx紧] = { ...this.ads[idx紧], ...updates };
    this.saveToStorage();
    return this.ads[idx紧];
  }

  public deleteAd(id: string): boolean {
    const lenBefore = this.ads.length;
    this.ads = this.ads.filter((a) => a.id !== id);
    if (this.ads.length !== lenBefore) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public toggleActive(id: string): boolean {
    const ad = this.ads.find((a) => a.id === id);
    if (ad) {
      ad.active = !ad.active;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public recordView(id: string) {
    const ad = this.ads.find((a) => a.id === id);
    if (ad) {
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      this.saveToStorage();
    }
  }

  public recordClick(id: string) {
    const ad = this.ads.find((a) => a.id === id);
    if (ad) {
      ad.clicksCount = (ad.clicksCount || 0) + 1;
      this.saveToStorage();
    }
  }

  public resetToDefaults() {
    this.ads = DEFAULT_ADS;
    this.saveToStorage();
  }
}

export const adService = new AdService();
