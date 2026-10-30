'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PublicActivity } from '@/types';
import { formatDateBengali } from '@/lib/utils';
import { Calendar, MapPin, Tag, HeartHandshake, Eye } from 'lucide-react';

interface ActivitiesProps {
  activities: PublicActivity[];
}

export const Activities: React.FC<ActivitiesProps> = ({ activities }) => {
  const [selectedActivity, setSelectedActivity] = useState<PublicActivity | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const categories = [
    { key: 'ALL', label: 'সকল কার্যক্রম' },
    { key: 'RELIEF', label: 'ত্রাণ ও পুনর্বাসন' },
    { key: 'EDUCATION', label: 'প্রশিক্ষণ ও শিক্ষা' },
    { key: 'COMMUNITY', label: 'সামাজিক বনায়ন ও সেবা' },
  ];

  const filtered = filter === 'ALL'
    ? activities
    : activities.filter((a) => a.category === filter);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'RELIEF': return 'ত্রাণ ও মানবিক সেবা';
      case 'EDUCATION': return 'প্রশিক্ষণ ও দক্ষতা';
      case 'HEALTH': return 'স্বাস্থ্যসেবা';
      case 'COMMUNITY': return 'সামাজিক উন্নয়ন';
      case 'MICROFINANCE': return 'ক্ষুদ্র সঞ্চয়';
      default: return 'সাধারণ সেবা';
    }
  };

  return (
    <section id="activities" className="py-20 bg-white border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-orange-100 text-brand-orange-700 text-xs font-bold tracking-wide">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>জনকল্যাণ ও সামাজিক সেবা</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy-950">
              আমাদের সামাজিক কার্যক্রম ও প্রকল্পসমূহ
            </h2>
            <p className="text-sm text-gray-600">
              তৃণমূল পর্যায়ে অসহায় মানুষের পাশে দাঁড়াতে আমাদের নিয়মিত সামাজিক উদ্যোগ ও সফল সমাপ্ত প্রকল্পের বাস্তব চিত্র।
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filter === c.key
                    ? 'bg-brand-green-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-brand-green-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <Image
                  src={act.imageUrl}
                  alt={act.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-brand-navy-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-brand-orange-400" />
                  <span>{getCategoryLabel(act.category)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-green-600" />
                      <span>{formatDateBengali(act.date)}</span>
                    </span>
                    {act.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange-500" />
                        <span className="truncate">{act.location}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-gray-900 group-hover:text-brand-green-800 transition line-clamp-2 leading-snug">
                    {act.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedActivity(act)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-brand-green-50 text-brand-green-900 hover:text-brand-green-800 font-bold text-xs border border-gray-200 hover:border-brand-green-300 transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>বিস্তারিত ও ছবি দেখুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for viewing activity details */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
              <div className="relative h-72 w-full bg-gray-900">
                <Image
                  src={selectedActivity.imageUrl}
                  alt={selectedActivity.title}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto space-y-4">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded">
                    {getCategoryLabel(selectedActivity.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateBengali(selectedActivity.date)}</span>
                  </span>
                  {selectedActivity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedActivity.location}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {selectedActivity.title}
                </h3>
                {selectedActivity.caption && (
                  <p className="text-xs italic text-gray-500 border-l-2 border-brand-orange-500 pl-3">
                    ছবি ক্যাপশন: {selectedActivity.caption}
                  </p>
                )}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedActivity.description}
                </p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>প্রকাশক: {selectedActivity.authorName}</span>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
