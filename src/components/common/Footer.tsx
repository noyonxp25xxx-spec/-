import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Heart, ShieldCheck, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy-950 text-white mt-auto pt-16 pb-8 border-t-4 border-brand-green-700">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-navy-800">
          {/* Organization Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white">
                <Image src="/logo.jpg" alt="লোগো" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white leading-snug">
                  ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা
                </h3>
                <p className="text-xs text-brand-orange-400 font-medium">
                  "মানবতার সেবায়, উন্নয়নের প্রত্যয়ে"
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা প্রান্তিক জনগোষ্ঠীর আত্মসামাজিক উন্নয়ন, ক্ষুদ্র সঞ্চয় বিকাশ ও মানবিক সহায়তায় দায়বদ্ধ একটি নিবন্ধিত সমাজকল্যাণ ও সমবায় সংগঠন।
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-green-400">
              <ShieldCheck className="w-4 h-4 text-brand-green-500" />
              <span>নিবন্ধিত ও নিয়ন্ত্রিত সমবায় প্রতিষ্ঠান</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-orange-500 pl-2.5">
              গুরুত্বপূর্ণ লিঙ্কসমূহ
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/#about" className="hover:text-brand-orange-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green-500" />
                  আমাদের ইতিহাস ও পটভূমি
                </Link>
              </li>
              <li>
                <Link href="/#mission" className="hover:text-brand-orange-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green-500" />
                  লক্ষ্য, উদ্দেশ্য ও দর্শন
                </Link>
              </li>
              <li>
                <Link href="/#activities" className="hover:text-brand-orange-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green-500" />
                  চলমান জনকল্যাণমূলক প্রকল্প
                </Link>
              </li>
              <li>
                <Link href="/#notices" className="hover:text-brand-orange-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green-500" />
                  অফিসিয়াল নোটিশ ও সার্কুলার
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-brand-orange-400 flex items-center gap-1.5 transition">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-green-500" />
                  সরাসরি যোগাযোগ ও সহায়তা
                </Link>
              </li>
            </ul>
          </div>

          {/* Secure Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-orange-500 pl-2.5">
              অভ্যন্তরীণ পোর্টাল
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/login" className="hover:text-brand-green-400 flex items-center gap-1.5 transition font-semibold text-white">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-orange-500" />
                  অফিসিয়াল পোর্টাল লগইন (সিইও, কর্মী ও আইটি)
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-brand-navy-900/60 border border-brand-navy-800 text-[11px] text-gray-400">
              <span className="text-brand-orange-400 font-bold block mb-1">নিরাপত্তা সতর্কতা:</span>
              আর্থিক ও প্রশাসনিক তথ্য শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য সংরক্ষিত। অননুমোদিত প্রবেশ আইনত দণ্ডনীয়।
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-brand-orange-500 pl-2.5">
              যোগাযোগের ঠিকানা
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange-400 flex-shrink-0 mt-0.5" />
                <span>প্রধান কার্যালয়: ভবন-৪, মেইন রোড, সদর, বাংলাদেশ</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-green-400 flex-shrink-0" />
                <span>+৮৮০ ১৭১২-৩৪৫৬৭৮</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange-400 flex-shrink-0" />
                <span>contact@bhaggounnayan.org</span>
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-gray-400 block">জরুরি হেল্পলাইন:</span>
                <span className="text-sm font-bold text-brand-orange-400">+৮৮০ ১৯৯৯-০০০১১১</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © ২০২৬ ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>নির্মিত হয়েছে</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" />
            <span>মানবতার কল্যাণে</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
