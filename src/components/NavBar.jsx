import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DonationModal from '../features/DonationModal';
import { useSettings } from '../context/SettingsContext';
import NavBarLogo from './NavBarLogo';

const NavBar = () => {
  const { settings } = useSettings();
  const [toggle, setToggle] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = settings.navLinks ?? [];

  /** Anchor links only work on the landing page — route there first. */
  const handleNav = (link) => {
    setToggle(false);
    const href = link.href ?? `/#${link.id}`;
    if (href.startsWith('/#')) {
      const hash = href.slice(1);
      if (location.pathname !== '/') {
        navigate(`/${hash}`);
      } else {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <div>
      <nav className="w-full flex items-center absolute top-0 z-20 bg-primary">
        <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className={toggle ? '-mt-10' : ''}>
              <NavBarLogo />
            </div>
          </Link>

          <ul className="list-none hidden sm:flex flex-row gap-10">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleNav(link)}
                  className="text-[#1D0061] hover:text-[#D9342E] text-[18px] font-bold cursor-pointer"
                >
                  {link.title}
                </button>
              </li>
            ))}
            {settings.donation?.isEnabled !== false && (
              <li>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="rounded-md bg-[#1D0061] px-5 py-2 text-white text-[16px] font-bold"
                >
                  {settings.donation?.footerCta ?? 'দান করুন'}
                </button>
              </li>
            )}
          </ul>

          <div className="sm:hidden flex flex-1 justify-end items-center mr-6">
            <button
              type="button"
              aria-label="মেনু"
              aria-expanded={toggle}
              className="flex h-8 w-8 flex-col justify-center gap-1.5"
              onClick={() => setToggle((v) => !v)}
            >
              <span className="block h-0.5 w-6 bg-[#1D0061]" />
              <span className="block h-0.5 w-6 bg-[#1D0061]" />
              <span className="block h-0.5 w-6 bg-[#1D0061]" />
            </button>

            {toggle && (
              <div className="p-6 bg-white/95 absolute top-20 right-0 mx-4 my-2 min-w-[180px] z-10 rounded-xl shadow-lg">
                <ul className="list-none flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <button
                        type="button"
                        onClick={() => handleNav(link)}
                        className="text-[#1D0061] font-medium text-[16px]"
                      >
                        {link.title}
                      </button>
                    </li>
                  ))}
                  {settings.donation?.isEnabled !== false && (
                    <li>
                      <button
                        type="button"
                        onClick={() => { setToggle(false); setIsOpen(true); }}
                        className="text-[#D9342E] font-bold text-[16px]"
                      >
                        {settings.donation?.footerCta ?? 'দান করুন'}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isOpen && <DonationModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </div>
  );
};

export default NavBar;
