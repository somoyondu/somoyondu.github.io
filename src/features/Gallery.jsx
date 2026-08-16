import { Link } from 'react-router-dom';
import { useGallery } from '../api/queries';
import ImageSlider from '../components/ImageSlider';
import { Skeleton, SectionError } from '../components/Skeleton';
import { useSettings } from '../context/SettingsContext';

const containerStyles = {
  width: '500px',
  maxWidth: '100%',
  height: '500px',
  margin: '0 auto',
};

const Gallery = () => {
  const { settings } = useSettings();
  const { data, isLoading, isError, refetch } = useGallery(30);

  return (
    <div className="bg-[#FFF3CF] py-6 my-6" id="gallery">
      <div className="text-center">
        <h2 className="text-2xl lg:text-4xl text-center font-bold pb-4 pt-6 text-[#1D0061]">
          {settings.galleryBlurb?.title ?? 'গ্যালারি'}
        </h2>
        <p className="text-xl mb-6">{settings.galleryBlurb?.subtitle}</p>

        {isLoading && (
          <div style={containerStyles}>
            <Skeleton className="h-full w-full" />
          </div>
        )}

        {isError && <SectionError message="গ্যালারি লোড করা যায়নি" onRetry={refetch} />}

        {!isLoading && !isError && (data?.length ? (
          <>
            <div style={containerStyles}>
              <ImageSlider>
                {data.map((image) => (
                  <img
                    key={image.key ?? image.id}
                    src={image.url}
                    alt={image.title}
                    loading="lazy"
                    decoding="async"
                    style={{ backgroundImage: `url(${image.placeholder ?? ''})`, backgroundSize: 'cover' }}
                  />
                ))}
              </ImageSlider>
            </div>
            <Link
              to="/gallery"
              className="mt-6 inline-block rounded-md bg-[#1D0061] px-6 py-2 text-white lg:px-10 lg:py-3"
            >
              সব অ্যালবাম দেখুন
            </Link>
          </>
        ) : (
          <p className="py-4 text-center">এখনো কোনো ছবি যোগ করা হয়নি</p>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
