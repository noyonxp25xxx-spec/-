import React from 'react';
import { Target, Eye, CheckCircle2, Award, Users2, Landmark } from 'lucide-react';

interface AboutProps {
  aboutText?: string;
  missionText?: string;
  visionText?: string;
  objectives?: string[];
}

export const About: React.FC<AboutProps> = ({
  aboutText,
  missionText,
  visionText,
  objectives = [],
}) => {
  const defaultObjectives = [
    'সদস্যদের মাঝে নিয়মিত সঞ্চয়ী মনোভাব ও আর্থিক শৃঙ্খলা গড়ে তোলা',
    'প্রান্তিক কৃষক, ক্ষুদ্র ব্যবসায়ী ও মহিলাদের আত্মকর্মসংস্থানে সহায়তা',
    'দুর্যোগপীড়িত ও অসচ্ছল পরিবারের মাঝে মানবিক ত্রাণ ও বস্ত্র বিতরণ',
    'চিকিৎসা সহায়তা ও ফ্রি মেডিকেল ক্যাম্প আয়োজন',
    'যুবসমাজকে কারিগরি ও প্রযুক্তিগত প্রশিক্ষণ দিয়ে দক্ষ জনশক্তিতে রূপান্তর',
    'পরিবেশ রক্ষায় সামাজিক বনায়ন ও বৃক্ষরোপণ কর্মসূচি পরিচালনা'
  ];

  const displayObjectives = objectives.length > 0 ? objectives : defaultObjectives;

  return (
    <div id="about" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20">
        {/* Section 1: About Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-green-100 text-brand-green-800 text-xs font-bold tracking-wide">
              <span>আমাদের পরিচিতি</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy-950 leading-tight">
              ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা সম্পর্কে জানুন
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              {aboutText ||
                'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা একটি তৃণমূলমুখী অরাজনৈতিক, অলাভজনক ও সেবামূলক সমবায় সংগঠন। আমরা গ্রামীণ ও চরাঞ্চলের অনগ্রসর জনগোষ্ঠীর জীবনমানের গুণগত পরিবর্তন সাধন, ক্ষুদ্র সঞ্চয় উৎসাহিতকরণ ও আর্থ-সামাজিক নিরাপত্তা বেষ্টনী তৈরিতে একাগ্রভাবে নিয়োজিত।'}
            </p>
            <p className="text-gray-600 leading-relaxed text-sm">
              আমাদের মূল বিশ্বাস—ক্ষুদ্র ক্ষুদ্র সঞ্চয় এবং পারস্পরিক সৌহার্দ্যপূর্ণ সমবায় চেতনার মাধ্যমেই একজন সাধারণ মানুষ নিজের ভাগ্যের চাকা নিজেই ঘোরাতে পারেন। আমরা সেই যাত্রায় তাদের সৎ ও বিশ্বস্ত সহযাত্রী।
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-3">
                <Landmark className="w-6 h-6 text-brand-green-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">সমবায় সঞ্চয়</h4>
                  <p className="text-xs text-gray-500 mt-0.5">নিরাপদ ও সুশৃঙ্খল তহবিল সঞ্চয়</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-3">
                <Users2 className="w-6 h-6 text-brand-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">সামাজিক একতা</h4>
                  <p className="text-xs text-gray-500 mt-0.5">পারস্পরিক সহযোগিতার সংস্কৃতি</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-brand-green-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-orange-500" />
                  <span>আমাদের মূল মূল্যবোধ ও অঙ্গীকার</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      ১
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-800">স্বচ্ছতা ও পূর্ণ জবাবদিহিতা</h5>
                      <p className="text-xs text-gray-600 mt-0.5">প্রতিটি পাই-পয়সা লেনদেনের ডিজিটাল খতিয়ান ও কেন্দ্রীয় সিইও কর্তৃক দ্বৈত অনুমোদন ব্যবস্থা।</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      ২
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-800">মানবতার নিঃস্বার্থ সেবা</h5>
                      <p className="text-xs text-gray-600 mt-0.5">বিপদগ্রস্ত পরিবারের পাশে দাঁড়ানো এবং যেকোনো দুর্যোগে তাৎক্ষণিক মানবিক খাদ্য ও চিকিৎসা সহায়তা।</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      ৩
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-800">নারীর ক্ষমতায়ন ও আত্মনির্ভরশীলতা</h5>
                      <p className="text-xs text-gray-600 mt-0.5">গৃহিণীদের কুটির শিল্প, সেলাই ও হাঁস-মুরগি পালনে উদ্বুদ্ধ করে আয়ের সুযোগ সৃষ্টি।</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Mission & Vision */}
        <div id="mission" className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-brand-navy-950">
              আমাদের লক্ষ্য, উদ্দেশ্য ও দর্শন
            </h2>
            <p className="text-sm text-gray-600">
              একটি দারিদ্র্যমুক্ত, শিক্ষিত ও আত্মমর্যাদাশীল বাংলাদেশ বিনির্মাণে আমাদের সুনির্দিষ্ট রূপরেখা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-gradient-to-br from-brand-green-900 to-brand-green-800 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-brand-orange-400 mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">আমাদের মিশন (Mission)</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                {missionText ||
                  'প্রান্তিক ও খেটে খাওয়া মানুষের অর্থনৈতিক সক্ষমতা বৃদ্ধি, তাদের মাঝে সঞ্চয়ী সংস্কৃতি সৃষ্টি এবং সামাজিক সুরক্ষা বলয় তৈরির মাধ্যমে একটি বৈষম্যহীন সমাজ গঠন করা।'}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-gradient-to-br from-brand-navy-900 to-brand-navy-800 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-500/10 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-brand-orange-400 mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">আমাদের ভিশন (Vision)</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {visionText ||
                  'একটি সমৃদ্ধ, আত্মনির্ভরশীল ও দারিদ্র্যমুক্ত সমাজ বিনির্মাণ—যেখানে প্রতিটি নাগরিক সমান সুযোগ, উন্নত স্বাস্থ্যসেবা ও অর্থনৈতিক স্বাবলম্বী জীবনযাপন করতে সক্ষম হবেন।'}
              </p>
            </div>
          </div>

          {/* Core Objectives Checklist */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">
              সংস্থার সুনির্দিষ্ট কার্য-উদ্দেশ্যসমূহ:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
