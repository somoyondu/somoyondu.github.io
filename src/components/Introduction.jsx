import { useSettings } from '../context/SettingsContext';

const Introduction = () => {
  const { settings } = useSettings();
  const hero = settings.hero ?? {};

  return (
    <div className="left ml-16 w-1/2 lg:w-1/3">
      <h1 className="text-4xl lg:text-7xl font-bold py-2 lg:py-6">
        {hero.headline ?? settings.siteName}
      </h1>
      <p className="text-2xl lg:text-4xl font-semibold py-2 lg:pb-6">
        {hero.subheadline ?? settings.tagline}
      </p>
      <p className="text-lg lg:text-xl">{hero.body}</p>
    </div>
  );
};

export default Introduction;
