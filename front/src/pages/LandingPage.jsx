import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import QuickAccess from '../components/QuickAccess';
import NeedsGrid from '../components/NeedsGrid';
import NearbyProfessionals from '../components/NearbyProfessionals';
import EConsultBanner from '../components/EConsultBanner';
import StepsSection from '../components/StepsSection';
import TrustMetrics from '../components/TrustMetrics';
import ProBanner from '../components/ProBanner';
import Faq from '../components/Faq';
import PreFooter from '../components/PreFooter';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickAccess />
        <NeedsGrid />
        <NearbyProfessionals />
        <EConsultBanner />
        <StepsSection />
        <TrustMetrics />
        <ProBanner />
        <Faq />
        <PreFooter />
      </main>
      <Footer />
    </>
  );
}
