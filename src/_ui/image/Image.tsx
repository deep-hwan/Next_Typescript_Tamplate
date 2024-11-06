/** @jsxImportSource @emotion/react */
import { useUid } from '@/libs/hooks';
import Image from 'next/image';
import { ForwardedRef, forwardRef, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { PopupImageWrapper } from './instances/PopupImageWrapper';

type SizeThemeType = {
  size?: {
    width?: 'auto' | '100%' | string | number;
    minWidth?: number | string;
    maxWidth?: number | string;
    height?: 'auto' | '100%' | string | number;
    minHeight?: number | string;
    maxHeight?: number | string;
  };
  ratio?: { x?: number; y?: number };
  shadow?: { x?: number; y?: number; blur?: number; color?: string };
  scale?: number;
  borderRadius?: string | number;
};

type Types = {
  source: string;
  alt: string;
  zoomUp?: boolean;
  objectFit?: 'cover' | 'fill' | 'contain';
  priority?: boolean;
  quality?: number;
  isHover?: boolean;
} & SizeThemeType &
  Omit<HTMLAttributes<HTMLImageElement>, 'objectFit'>;

const ImageInstance = forwardRef(function ImageInstance(
  { source, alt, objectFit, zoomUp, ...props }: Types,
  ref?: ForwardedRef<HTMLImageElement>
) {
  const uid = useUid();

  const imgRef = useRef<HTMLImageElement>(null);
  const [isHover, setIsHover] = useState(false);
  const [zoomImg, setZoomImg] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const aspectRatio = naturalWidth / naturalHeight;
    setImageAspectRatio(aspectRatio);
    setIsLoaded(true);
  };

  const handleOnClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (source && zoomUp) {
      setZoomImg(true);
      props.onClick?.(event);
    } else {
      props.onClick?.(event);
    }
  };

  const imageWrapperStyle = (props: SizeThemeType) => ({
    position: 'relative',
    width: props.size?.width ?? '100%',
    minWidth: props.size?.minWidth,
    maxWidth: props.size?.maxWidth,
    minHeight: props.size?.minHeight,
    maxHeight: props.size?.maxHeight,
    borderRadius: props.borderRadius,
    aspectRatio: props.ratio ? `${props.ratio.x}/${props.ratio.y}` : imageAspectRatio,
    transition: '0.3s ease-in-out',
    boxShadow: props.shadow
      ? `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.color}`
      : undefined,
    userSelect: 'none',
    overflow: 'hidden',
    scale: props.scale,
  });

  const clickModalOutside = useCallback(
    (event: MouseEvent) => {
      if (zoomImg && imgRef.current && !imgRef.current.contains(event.target as Node)) setZoomImg(false);
    },
    [zoomImg]
  );

  useEffect(() => {
    if (zoomImg) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflowY = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflowY = 'auto';

      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    document.addEventListener('mousedown', clickModalOutside);
    return () => document.removeEventListener('mousedown', clickModalOutside);
  }, [zoomImg]);

  const onHover = () => {
    if (props.isHover) setIsHover(!isHover);
  };

  return (
    <>
      <div
        id={`image-wrap-${uid}`}
        onMouseEnter={onHover}
        onMouseLeave={onHover}
        css={{
          ...(imageWrapperStyle(props) as any),
          cursor: props.onClick || zoomUp ? 'pointer' : 'default',
        }}
        {...props}
      >
        <Image
          id={`image-${uid}`}
          itemProp='image'
          ref={ref}
          src={source}
          alt={alt}
          priority={props.priority}
          fill
          blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AP7+//j9/+ry/wDe3NbEqorX1cwAkn9ndUYhjHddAAgEBBIODgcHCB3XE9M/sWuRAAAAAElFTkSuQmCC'
          quality={props.quality ?? 75}
          placeholder='blur'
          loading={props?.priority ? 'eager' : 'lazy'}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          onClick={handleOnClick}
          onLoad={handleImageLoad}
          css={{
            overflow: 'hidden',
            objectFit: objectFit ?? 'cover',
            width: '100%',
            height: '100%',
            filter: isLoaded ? 'none' : 'blur(10px)',
            transition: 'filter 0.3s ease-in-out',
            scale: isHover ? 1.05 : 1,
          }}
        />
      </div>

      {zoomImg && (
        <PopupImageWrapper onCancel={() => setZoomImg(false)}>
          <div
            className='zoom-image'
            ref={imgRef}
            css={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxWidth: 1200,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Image
              ref={ref}
              src={source}
              alt={alt}
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AP7+//j9/+ry/wDe3NbEqorX1cwAkn9ndUYhjHddAAgEBBIODgcHCB3XE9M/sWuRAAAAAElFTkSuQmCC'
              priority={props.priority}
              fill
              quality={props.quality ?? 75}
              loading='lazy'
              objectFit='contain'
              style={{ objectFit: 'contain' }}
              css={{ width: '100%' }}
            />
          </div>
        </PopupImageWrapper>
      )}
    </>
  );
});

export default ImageInstance;
