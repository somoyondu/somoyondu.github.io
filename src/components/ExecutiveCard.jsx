const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23e5e7eb"/><circle cx="48" cy="38" r="18" fill="%23cbd5e1"/><ellipse cx="48" cy="82" rx="30" ry="22" fill="%23cbd5e1"/></svg>';

const ExecutiveCard = ({ executive }) => {
  const image = executive.imageSet ?? {};
  const src = executive.image ?? image.url ?? FALLBACK_AVATAR;

  return (
    <div className="group ease-in-out transition w-36 lg:w-64 mx-4 my-2 p-1 lg:p-8 bg-white hover:bg-[#6251A7] lg:ring-4 ring-2 ring-[#6251A7] rounded-xl shadow-md transform hover:scale-105 duration-500">
      <img
        className="h-12 w-12 lg:h-24 lg:w-24 mx-auto rounded-full lg:ring-4 ring-2 ring-[#6251A7] group-hover:ring-[#F8DE22] mt-3 lg:mt-7 object-cover bg-gray-100"
        src={src}
        srcSet={image.url && image.url2x ? `${image.url} 1x, ${image.url2x} 2x` : undefined}
        alt={`${executive.name}${executive.designation ? ` — ${executive.designation}` : ''}`}
        loading="lazy"
        decoding="async"
        width="96"
        height="96"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_AVATAR;
        }}
      />

      <div className="text-center space-y-2 my-5 lg:my-1">
        <div className="space-y-0.5">
          <p className="text-xs lg:text-lg text-black group-hover:text-white font-semibold">
            {executive.name}
          </p>
          <p className="text-xs lg:text-lg text-gray-500 group-hover:text-white font-medium">
            {executive.designation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCard;
