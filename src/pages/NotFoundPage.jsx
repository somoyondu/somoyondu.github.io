import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const NotFoundPage = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
    <Seo title="পাতাটি পাওয়া যায়নি" />
    <p className="text-6xl font-bold text-[#1D0061]">৪০৪</p>
    <h1 className="mt-3 text-xl font-semibold">দুঃখিত, পাতাটি খুঁজে পাওয়া যায়নি</h1>
    <Link to="/" className="mt-6 rounded-md bg-[#1D0061] px-6 py-2 text-white">হোমপেজে ফিরে যান</Link>
  </div>
);

export default NotFoundPage;
