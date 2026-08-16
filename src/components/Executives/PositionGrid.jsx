import ExecutiveCard from '../ExecutiveCard';

/**
 * One grid for one group of positions. Replaces the five near-identical
 * components that each called their own hardcoded service file.
 */
const PositionGrid = ({ positions = [] }) => {
  if (!positions.length) return null;
  return (
    <div className="mx-6 lg:mx-20 mt-5 lg:mt-10 grid gap-1 lg:gap-4 grid-cols-2 lg:grid-cols-4">
      {positions.map((position) => (
        <ExecutiveCard key={position.id ?? position.name} executive={position} />
      ))}
    </div>
  );
};

export default PositionGrid;
