import Advisors from '../components/Advisors';
import { useSettings } from '../context/SettingsContext';

const AdvisoryCommittee = () => {
  const { settings } = useSettings();

  return (
    <div className="py-2 my-1 lg:py-6 lg:my-6" id="advisors">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl text-center font-bold pb-4 text-[#1D0061]">
          {settings.advisoryBlurb?.title ?? 'আমাদের উপদেষ্টামণ্ডলী'}
        </h2>
        <p className="text-md mx-6 whitespace-pre-line">{settings.advisoryBlurb?.body}</p>
      </div>
      <Advisors />
    </div>
  );
};

export default AdvisoryCommittee;
