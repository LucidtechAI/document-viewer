import { CanvasHTMLAttributes, useLayoutEffect, useMemo, useRef, useState } from 'react';
import UTIF from 'utif';
import styles from './TIFFViewer.module.css';
import { ZoomState, debounce, getZoomStyle } from './';

type RGBData = {
  data: Uint8Array;
  width: number;
  height: number;
};

type TIFFPageProps = RGBData & CanvasHTMLAttributes<HTMLCanvasElement>;
const TIFFPage = ({ data, width, height, ...rest }: TIFFPageProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  if (ref.current) {
    const ctx = ref.current.getContext('2d');
    const clampedArray = Uint8ClampedArray.from(data);
    const imgData = new ImageData(clampedArray, width, height);
    ctx?.putImageData(imgData, 0, 0);
  }

  return <canvas width={width} height={height} ref={ref} {...rest} />;
};

type TIFFViewerProps = {
  doc: string;
  zoom?: ZoomState;
};
const TIFFViewer = ({ doc, zoom = 1 }: TIFFViewerProps): JSX.Element => {
  const [width, setWidth] = useState(600 * zoom);

  const docContainerRef = useRef<HTMLDivElement | null>(null);

  const pages = useMemo(() => {
    const binData = Uint8Array.from(atob(doc || ''), (c) => c.charCodeAt(0));
    const decodedDocPages: Array<RGBData> = [];
    try {
      const data = UTIF.decode(binData);
      for (const page of data) {
        UTIF.decodeImage(binData, page);
        const decodedImage = UTIF.toRGBA8(page);
        decodedDocPages.push({ data: decodedImage, width: page.width || 600, height: page.height || 600 * 1.33 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      return decodedDocPages;
    }
  }, [doc]);

  useLayoutEffect(() => {
    if (docContainerRef.current) {
      const containerWidth = docContainerRef.current.getBoundingClientRect().width;
      setWidth(containerWidth * zoom);
    }
  }, []);

  useLayoutEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      if (docContainerRef.current) {
        const containerWidth = docContainerRef.current.getBoundingClientRect().width;
        setWidth(containerWidth * zoom);
      }
    }, 30);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  const zoomStyle = getZoomStyle(zoom);

  return (
    <div ref={docContainerRef} className={`${styles.document} ${zoomStyle}`}>
      {pages.map((page, index) => {
        return (
          <TIFFPage
            key={index}
            width={page.width}
            height={page.height}
            data={page.data}
            style={{ width, height: 'auto' }}
            className={styles.page}
          />
        );
      })}
    </div>
  );
};

export default TIFFViewer;
