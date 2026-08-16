import { useSettings } from '../../context/SettingsContext';
import InfoCard from './InfoCard';

const DonationCard = () => {
  const { settings } = useSettings();
  const methods = settings.donation?.methods ?? [];

  if (!methods.length) {
    return <p className="my-6 text-center text-sm text-gray-500">পেমেন্ট তথ্য শীঘ্রই যোগ করা হবে</p>;
  }

  return (
    <div className="m-8 flex flex-col lg:flex-row">
      {methods.map((method) => (
        <InfoCard key={`${method.name}-${method.number}`} method={method} />
      ))}
    </div>
  );
};

export default DonationCard;
