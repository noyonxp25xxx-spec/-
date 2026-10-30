import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Hero } from '@/components/homepage/Hero';
import { About } from '@/components/homepage/About';
import { Activities } from '@/components/homepage/Activities';
import { Notices } from '@/components/homepage/Notices';
import { Contact } from '@/components/homepage/Contact';
import { PWAInstaller } from '@/components/common/PWAInstaller';
import { store } from '@/lib/services/data-store';

export const revalidate = 0; // Dynamic server render for latest notices and content

export default function HomePage() {
  const settings = store.getSettings();
  const publishedNotices = store.getNotices().filter((n) => n.isPublished);
  const publishedActivities = store.getActivities().filter((a) => a.isPublished);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero
          headline={settings.heroHeadline}
          subtitle={settings.heroSubtitle}
        />
        <About
          aboutText={settings.aboutText}
          missionText={settings.missionText}
          visionText={settings.visionText}
          objectives={settings.objectives}
        />
        <Activities activities={publishedActivities} />
        <Notices notices={publishedNotices} />
        
        {/* PWA Mobile Installation Section */}
        <section className="py-10 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <PWAInstaller variant="banner" />
          </div>
        </section>

        <Contact
          phone={settings.contactPhone}
          email={settings.contactEmail}
          address={settings.contactAddress}
          emergencyHotline={settings.emergencyHotline}
        />
      </main>
      <Footer />
    </div>
  );
}
