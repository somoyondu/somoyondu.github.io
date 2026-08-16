import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();
  const contact = settings.contact ?? {};

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex flex-col items-center mb-2 lg:mr-16">
        <h3 className="text-white font-semibold text-md lg:text-lg">তথ্য</h3>
        <a className="text-gray-400 font-bold text-sm lg:text-md" href="/#about">আমাদের সম্পর্কে</a>
        <a className="text-gray-400 font-bold text-sm lg:text-md" href="/#gallery">আমাদের কার্যক্রম</a>
        <a className="text-gray-400 font-bold text-sm lg:text-md" href="/#advisors">উপদেষ্টামণ্ডলী</a>
        <Link className="text-gray-400 font-bold text-sm lg:text-md" to="/notices">নোটিশ</Link>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-white font-bold text-md lg:text-lg">যোগাযোগ</h3>
        {contact.facebookPage && (
          <a
            className="text-gray-400 font-bold text-sm lg:text-md"
            href={contact.facebookPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            ফেসবুক পেজ
          </a>
        )}
        {contact.email && (
          <a className="text-gray-400 font-bold text-sm lg:text-md" href={`mailto:${contact.email}`}>
            ইমেইল: {contact.email}
          </a>
        )}
        {contact.phone && (
          <a className="text-gray-400 font-bold text-sm lg:text-md" href={`tel:${contact.phone}`}>
            মোবাইল: {contact.phone}
          </a>
        )}
        <Link className="text-gray-400 font-bold text-sm lg:text-md mt-1" to="/contact">
          বার্তা পাঠান →
        </Link>
      </div>
    </div>
  );
};

export default Contact;
