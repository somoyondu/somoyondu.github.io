import Introduction from '../components/Introduction';
import NavBar from '../components/NavBar';
import { useSettings } from '../context/SettingsContext';

const Header = () => {
  const { settings } = useSettings();

  const backgroundStyle = {
    backgroundImage: `url("${settings.heroBackgroundUrl ?? '/somoyon-bg.png'}")`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-start" style={backgroundStyle}>
        <NavBar />
        <Introduction />
      </div>
    </div>
  );
};

export default Header;
