'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, Clock } from 'lucide-react';

interface ContactProps {
  phone?: string;
  email?: string;
  address?: string;
  emergencyHotline?: string;
}

export const Contact: React.FC<ContactProps> = ({
  phone = '+৮৮০ ১৭১২-৩৪৫৬৭৮',
  email = 'contact@bhaggounnayan.org',
  address = 'ভবন-৪, মেইন রোড, সদর, বাংলাদেশ',
  emergencyHotline = '+৮৮০ ১৯৯৯-০০০১১১',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-brand-green-800 text-xs font-bold tracking-wide">
            <span>সরাসরি যোগাযোগ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-navy-950">
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-sm text-gray-600">
            সদস্য হওয়ার নিয়মাবলী, সঞ্চয় সংক্রান্ত তথ্য কিংবা যে কোনো সামাজিক সহায়তার জন্য আমাদের সাথে নির্দ্বিধায় যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 space-y-4">
              <h3 className="font-bold text-lg text-brand-navy-950 border-b border-gray-200 pb-3">
                অফিসিয়াল যোগাযোগের তথ্য
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green-100 text-brand-green-800 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs">প্রধান কার্যালয়ের ঠিকানা</h5>
                    <p className="text-xs text-gray-600 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs">মোবাইল ও ফোন</h5>
                    <p className="text-xs text-gray-600 mt-0.5">{phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs">অফিসিয়াল ইমেইল</h5>
                    <p className="text-xs text-gray-600 mt-0.5">{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs">কার্যালয় সময়সূচি</h5>
                    <p className="text-xs text-gray-600 mt-0.5">শনিবার থেকে বৃহস্পতিবার: সকাল ৯:০০ - বিকাল ৫:০০ (শুক্রবার বন্ধ)</p>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  জরুরী মানবিক ও ত্রাণ হেল্পলাইন:
                </div>
                <div className="text-xl font-black">{emergencyHotline}</div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              আমাদের কাছে আপনার বার্তা পাঠান
            </h3>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-900">ধন্যবাদ! বার্তাটি সফলভাবে পাঠানো হয়েছে।</h4>
                <p className="text-xs text-emerald-700">আমাদের দায়িত্বশীল কর্মকর্তা শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">আপনার পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ মোঃ আব্দুল করিম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-green-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭১২-৩৪৫৬৭৮"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-green-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">বিষয় / যোগাযোগের উদ্দেশ্য *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ নতুন সদস্য হওয়া সংক্রান্ত / ত্রাণ তথ্য"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-green-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">বিস্তারিত বার্তা *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-green-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-green-800 hover:bg-brand-green-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>বার্তা দাখিল করুন</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
