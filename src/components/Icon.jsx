const LABELS = {
  facebook: 'ফেসবুক',
  twitter: 'টুইটার',
  instagram: 'ইনস্টাগ্রাম',
  instragram: 'ইনস্টাগ্রাম',
  linkedin: 'লিংকডইন',
  youtube: 'ইউটিউব',
};

const Icon = ({ social }) => {
  const platform = social?.platform ?? '';
  const src = social?.iconUrl ?? `/${platform}.png`;

  return (
    <a
      href={social?.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABELS[platform] ?? platform}
    >
      <img src={src} alt="" className="h-8 w-8 object-contain" loading="lazy" />
    </a>
  );
};

export default Icon;
