import { useSettings } from '../context/SettingsContext';

/**
 * Shown when we are rendering the build-time snapshot because the API is
 * unreachable — typically a sleeping free-tier instance waking up.
 */
const StaleContentBanner = () => {
  const { isStale, isLoading } = useSettings();

  if (isLoading || !isStale) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#1D0061]/90 px-5 py-2 text-xs text-white shadow-lg">
      সংরক্ষিত তথ্য দেখানো হচ্ছে · সর্বশেষ হালনাগাদের জন্য অপেক্ষা করুন
    </div>
  );
};

export default StaleContentBanner;
