import { useState } from 'react';
import DonationModal from '../features/DonationModal';
import { useSettings } from '../context/SettingsContext';

const FooterTitle = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (settings.donation?.isEnabled === false) return null;

  return (
    <div>
      {isOpen && <DonationModal isOpen={isOpen} setIsOpen={setIsOpen} />}
      <h3 className="text-3xl text-gray-400 font-bold">
        {settings.donation?.footerTitle ?? 'প্রয়োজনে পাশে থাকুন'}
      </h3>
      <button
        type="button"
        className="text-xl text-white font-bold mb-20 underline"
        onClick={() => setIsOpen(true)}
      >
        {settings.donation?.footerCta ?? 'আজই দান করুন'}
      </button>
    </div>
  );
};

export default FooterTitle;
