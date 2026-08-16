const InfoCard = ({ method }) => (
  <div className="bg-white ring-2 ring-[#CBBEFF] rounded-xl shadow-md m-2 p-3 text-center">
    {method.iconUrl ? (
      <img src={method.iconUrl} alt={method.name} className="mx-auto h-10 object-contain" loading="lazy" />
    ) : (
      <p className="text-sm font-bold text-[#1D0061]">{method.name}</p>
    )}
    <p className="text-xs lg:text-xl font-semibold lg:font-bold">{method.number}</p>
    {method.type && <p className="text-[11px] text-gray-500">{method.type}</p>}
  </div>
);

export default InfoCard;
