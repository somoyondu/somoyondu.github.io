import { useSettings } from '../context/SettingsContext';
import Icon from './Icon';

const SocialMedia = () => {
  const { settings } = useSettings();
  const socials = settings.socials ?? [];

  if (!socials.length) return null;

  return (
    <div>
      <h3 className="text-md text-white font-semibold py-4">SOCIAL MEDIA</h3>
      <div className="flex flex-row items-center gap-2 lg:gap-5">
        {socials.map((social) => (
          <Icon key={social.platform} social={social} />
        ))}
      </div>
    </div>
  );
};

export default SocialMedia;
