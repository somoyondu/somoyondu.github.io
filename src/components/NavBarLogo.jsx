import { useSettings } from '../context/SettingsContext';

const NavBarLogo = () => {
  const { settings } = useSettings();
  return (
    <img
      src={settings.logoUrl ?? '/logo.png'}
      alt={settings.siteName ?? 'সময়ন'}
      className="ml-6 mt-2 lg:ml-0 lg:mt-0 w-16 h-16 lg:w-24 lg:h-24 object-contain"
      width="96"
      height="96"
    />
  );
};

export default NavBarLogo;
