import PositionGrid from './Executives/PositionGrid';

const GROUP_BY_TAB = {
  'top-executives': 'TOP_EXECUTIVE',
  organizing: 'ORGANIZING',
  official: 'OFFICIAL',
  members: 'MEMBER',
};

const ActiveExecutives = ({ selectedId, groups = {} }) => {
  const key = GROUP_BY_TAB[selectedId];
  return <PositionGrid positions={groups[key] ?? []} />;
};

export default ActiveExecutives;
