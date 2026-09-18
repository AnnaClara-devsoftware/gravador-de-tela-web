import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { TechStack } from '@/components/landing/TechStack';
import { PrivacySection } from '@/components/landing/PrivacySection';

export function LandingPage() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <PrivacySection />
      <TechStack />
    </div>
  );
}
