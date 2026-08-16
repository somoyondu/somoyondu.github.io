import { useSettings } from '../context/SettingsContext';

const Logo = () => {
  const { settings } = useSettings();
  return (
    <img
      src={settings.whiteLogoUrl ?? settings.logoUrl ?? '/white-logo.png'}
      alt={settings.siteName ?? 'সময়ন'}
      className="w-24 lg:w-52 h-auto"
      loading="lazy"
    />
  );
};

export default Logo;
