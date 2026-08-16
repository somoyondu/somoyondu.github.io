import FoundingLeaders from '../components/Executives/FoundingLeaders';
import { useSettings } from '../context/SettingsContext';

const FoundingMembers = () => {
  const { settings } = useSettings();

  return (
    <div className="py-6 my-6" id="founding">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl text-center font-bold pb-4 text-[#1D0061]">
          {settings.foundingBlurb?.title ?? 'প্রতিষ্ঠাতা সদস্যগণ'}
        </h2>
        <p className="text-md mx-6 whitespace-pre-line">{settings.foundingBlurb?.body}</p>
      </div>
      <div className="my-6" />
      <FoundingLeaders />
    </div>
  );
};

export default FoundingMembers;
