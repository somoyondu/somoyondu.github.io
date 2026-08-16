import { useSettings } from '../context/SettingsContext';

const AboutUs = () => {
  const { settings } = useSettings();

  return (
    <div className="my-6 py-6 w-full lg:w-1/2 center ml-4 lg:ml-80" id="about">
      <h2 className="text-2xl lg:text-3xl text-center font-bold pb-4 text-[#1D0061]">
        {settings.about?.title ?? 'আমাদের সম্পর্কে'}
      </h2>
      <p className="text-sm lg:text-base whitespace-pre-line">{settings.about?.body}</p>
    </div>
  );
};

export default AboutUs;
