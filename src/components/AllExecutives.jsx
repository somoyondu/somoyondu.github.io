import { useMemo, useState } from 'react';
import ActiveExecutives from './ActiveExecutives';

const TABS = [
  { id: 'top-executives', title: 'ঊর্ধ্বতন সদস্য', group: 'TOP_EXECUTIVE' },
  { id: 'organizing', title: 'সাংগঠনিক সম্পাদক', group: 'ORGANIZING' },
  { id: 'official', title: 'দাপ্তরিক সদস্য', group: 'OFFICIAL' },
  { id: 'members', title: 'কার্যনির্বাহী সদস্য', group: 'MEMBER' },
];

const AllExecutives = ({ groups = {} }) => {
  // Only show tabs that actually have members this year.
  const visibleTabs = useMemo(
    () => TABS.filter((tab) => (groups[tab.group] ?? []).length > 0),
    [groups],
  );

  const [activeId, setActiveId] = useState(visibleTabs[0]?.id ?? 'top-executives');
  const currentId = visibleTabs.some((t) => t.id === activeId)
    ? activeId
    : visibleTabs[0]?.id ?? 'top-executives';

  if (!visibleTabs.length) return null;

  return (
    <div>
      <nav className="w-full flex items-center top-0 bg-primary">
        <div className="w-full flex justify-between items-center max-w-7xl ml-12 lg:ml-96">
          <ul className="list-none flex flex-row gap-2 lg:gap-8">
            {visibleTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  className={`${
                    currentId === tab.id ? 'border-b-2 lg:border-b-4 border-red-500' : ''
                  } text-[#1D0061] text-[14px] lg:text-[18px] font-bold cursor-pointer`}
                  aria-current={currentId === tab.id ? 'true' : undefined}
                >
                  {tab.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <ActiveExecutives selectedId={currentId} groups={groups} />
    </div>
  );
};

export default AllExecutives;
