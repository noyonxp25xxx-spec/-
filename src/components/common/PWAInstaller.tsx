'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstaller: React.FC<{ variant?: 'banner' | 'button' | 'nav' }> = ({
  variant = 'button',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production only, clean up on localhost
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration error:', err);
          });
      }
    }

    // 2. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // 4. Capture beforeinstallprompt for Android Chrome / Desktop Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Capture appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // If prompt is not available yet, show instructions or notification
      setShowIOSModal(true);
      return;
    }

    // Trigger the native installation dialog
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 5000);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  // If already installed, hide the install UI
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Success Notification */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <h5 className="font-bold">অ্যাপটি সফলভাবে ইনস্টল হয়েছে!</h5>
            <p className="text-emerald-200">এখন সরাসরি আপনার হোম স্ক্রিন বা অ্যাপ ড্রয়ার থেকে চালু করুন।</p>
          </div>
        </div>
      )}

      {/* Button Variant (Used in Hero and Pages) */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-green-700 hover:from-emerald-500 hover:to-brand-green-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 border border-emerald-400/30 group"
          title="মোবাইল বা কম্পিউটারে অ্যাপ ইনস্টল করুন"
        >
          <Smartphone className="w-4 h-4 text-brand-orange-400 group-hover:scale-110 transition-transform" />
          <span>অ্যাপ ইনস্টল করুন (PWA)</span>
        </button>
      )}

      {/* Nav Variant (Used in Navbar) */}
      {variant === 'nav' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold border border-emerald-600/40 transition shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-brand-orange-400" />
          <span>অ্যাপ ইনস্টল</span>
        </button>
      )}

      {/* Banner Variant (Used above Footer or in Main Area) */}
      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-brand-navy-950 via-brand-green-950 to-brand-navy-900 text-white rounded-3xl p-6 md:p-8 border border-brand-green-600/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-green-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-green-500 bg-white shadow-md flex-shrink-0 mx-auto md:mx-0">
                <Image src="/icons/icon-192x192.png" alt="ভাগ্য উন্নয়ন লোগো" fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অফিসিয়াল প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-bengali">
                  মোবাইলে ইনস্টল করুন “ভাগ্য উন্নয়ন সমবায়” অ্যাপ
                </h3>
                <p className="text-xs text-gray-300 max-w-xl">
                  কোনো প্লে-স্টোর ছাড়াই সরাসরি ব্রাউজার থেকে ইনস্টল করুন। দ্রুততম গতিতে সঞ্চয় খতিয়ান ও নোটিশ দেখতে এক ক্লিকে প্রবেশ করুন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="px-6 py-3.5 rounded-2xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-sm shadow-xl shadow-brand-orange-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap self-stretch md:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>এখনই অ্যাপটি ইনস্টল করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari / Manual Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 text-gray-900 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-green-700 bg-white">
                  <Image src="/icons/icon-192x192.png" alt="লোগো" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 leading-tight">
                    মোবাইলে অ্যাপ ইনস্টল করার নিয়ম
                  </h4>
                  <p className="text-xs text-brand-green-800 font-semibold">
                    {isIOS ? 'iPhone / iPad (Safari ব্রাউজার)' : 'কম্পিউটার ও মোবাইল ব্রাউজার'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-4 text-xs text-gray-700">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">ধাপ ১: শেয়ার অপশন চাপুন</h5>
                  <p className="text-gray-500 mt-0.5">
                    {isIOS
                      ? 'সাফারি ব্রাউজারের নিচের দিকে অবস্থিত শেয়ার (Share) বাটন 📤 ট্যাপ করুন।'
                      : 'ব্রাউজার মেনুর ৩-ডট (⋮) অপশনে ট্যাপ করুন।'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">ধাপ ২: হোম স্ক্রিনে যোগ করুন</h5>
                  <p className="text-gray-500 mt-0.5">
                    মেনুর অপশনগুলো স্ক্রল করে <strong className="text-emerald-800">"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন ➕)</strong> নির্বাচন করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">ধাপ ৩: নিশ্চিত করুন</h5>
                  <p className="text-gray-500 mt-0.5">
                    উপরের ডান কোণে <strong>"Add" (যোগ করুন)</strong> চাপলেই অ্যাপটি সরাসরি আপনার ফোনের অ্যাপ তালিকায় যুক্ত হয়ে যাবে!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-xs shadow transition text-center"
              >
                বুঝতে পেরেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
