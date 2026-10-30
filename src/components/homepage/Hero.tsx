import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, Coins, Sparkles, HeartHandshake, FileText } from 'lucide-react';
import { PWAInstaller } from '@/components/common/PWAInstaller';

interface HeroProps {
  headline?: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({ headline, subtitle }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-green-950 via-brand-green-900 to-brand-navy-950 text-white py-16 md:py-24">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-orange-300">
              <Sparkles className="w-4 h-4 text-brand-orange-400" />
              <span>নিবন্ধিত আদর্শ সমবায় ও সমাজকল্যাণ প্রতিষ্ঠান</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white font-bengali">
              {headline || 'মানবতার সেবায় ও দারিদ্র্য বিমোচনে আমরা অঙ্গীকারবদ্ধ'}
            </h1>

            <p className="text-base md:text-lg text-gray-200 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
              {subtitle ||
                'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা প্রান্তিক জনগোষ্ঠীর আত্মসামাজিক উন্নয়ন, ক্ষুদ্র সঞ্চয় বৃদ্ধি ও মানবকল্যাণে নিবেদিত একটি আস্থার প্রতীক। "মানবতার সেবায়, উন্নয়নের প্রত্যয়ে" শ্লোগানকে সামনে রেখে আমরা কাজ করে যাচ্ছি।'}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4 flex-wrap">
              <Link
                href="/#activities"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-sm shadow-lg shadow-brand-orange-500/30 hover:shadow-brand-orange-500/50 transition-all flex items-center justify-center gap-2"
              >
                <span>আমাদের কার্যক্রম দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <PWAInstaller variant="button" />
              <Link
                href="/statement"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border-2 border-white/40 hover:border-brand-orange-400 backdrop-blur-md shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-brand-orange-400" />
                <span>স্টেটমেন্ট</span>
              </Link>
            </div>

            {/* Highlights Bar */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-center lg:text-left">
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-brand-orange-400">৫০০+</div>
                <div className="text-xs text-gray-300 font-medium">নিবন্ধিত সমবায় সদস্য</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-400">১০০%</div>
                <div className="text-xs text-gray-300 font-medium">স্বচ্ছ আর্থিক লেজার</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-300">১৫+</div>
                <div className="text-xs text-gray-300 font-medium">জনকল্যাণ প্রকল্প</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Animated Badge */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              {/* Outer decorative gradient ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-green-500 via-brand-orange-500 to-brand-navy-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

              {/* Logo Card */}
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden bg-white p-3 shadow-2xl border-4 border-white">
                <Image
                  src="/logo.jpg"
                  alt="ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা"
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>

              {/* Floating Trust Badge */}
              <div className="absolute -bottom-4 right-4 bg-white text-gray-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-brand-green-100 flex items-center justify-center text-brand-green-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-green-900">বিশ্বস্ত সমবায় সমিতি</div>
                  <div className="text-[10px] text-gray-600">সুরক্ষিত ও জবাবদিহিতামূলক তহবিল</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
