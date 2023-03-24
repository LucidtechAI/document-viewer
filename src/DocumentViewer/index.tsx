import { forwardRef, ReactNode, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { FiDownload, FiRotateCcw, FiRotateCw, FiZoomIn, FiZoomOut} from 'react-icons/fi'

import PDFViewer from './PDFViewer';
import SimpleImageViewer from './SimpleImageViewer';
import styles from './DocumentViewer.module.css';
import TIFFViewer from './TIFFViewer';
import { useDownload } from './useDownload';

export type DocumentType = 'image/jpeg' | 'application/pdf' | 'image/png' | 'image/tiff';

/* eslint-disable */
export function debounce(fn: (args: any) => void, ms: number): () => void {
  let timer: undefined | null | ReturnType<typeof setTimeout>;
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      timer = null;
      // @ts-ignore 🤷‍♀️
      fn.apply(this, arguments);
    }, ms);
  };
  /* eslint-enable */
}

export function getZoomStyle(zoom: ZoomState): string {
  const zoomStyleKey = styles[`zoom-${zoom*100}`];
  return zoomStyleKey;
}

export function getRotationStyle(rotation: Rotation): string {
  let rotationStyle = '';

  switch (rotation) {
    case 90:
      rotationStyle = styles['rotate-90'];
      break;
    case 180:
      rotationStyle = styles['rotate-180'];
      break;
    case 270:
      rotationStyle = styles['rotate-270'];
      break;
    default:
      break;
  }

  return rotationStyle;
}

export type ImperativeRef = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
};

export type DocumentViewerProps = {
  fileName?: string;
  doc?: string | null;
  documentType?: DocumentType | null;
  loading?: boolean;
  className?: string;
  loadingComponent?: ReactNode;
  onRotate?: (rotation: Rotation) => void;
  showPageCount?: boolean;
  initialRotation?: Rotation;
  url?: string;
};

const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;
export type ZoomState = typeof ZOOM_OPTIONS[number];
export type Rotation = 0 | 90 | 180 | 270;

/**
 * A viewer for PDF, TIFF and simple JPG/PNG image files.
 * The `ref` prop gives you access to an imperative handle, with some functions you can call
 * to interact with the viewer directly:
 * ref.current.onZoomIn, ...onZoomOut, ...moveUp, ...moveDown, ...moveLeft, ...moveRight
 */
const DocumentViewer = forwardRef<ImperativeRef, DocumentViewerProps>(
  (
    {
      doc,
      documentType,
      className = '',
      loading = false,
      fileName = 'download',
      loadingComponent = 'Loading...',
      onRotate: onRotateCallback,
      showPageCount,
      initialRotation = 0,
      url
    }: DocumentViewerProps,
    ref
  ): JSX.Element => {
    const isSimpleImage = documentType === 'image/jpeg' || documentType === 'image/png';
    const isTIFF = documentType === 'image/tiff';
    const isPDF = documentType === 'application/pdf';
    const fileAsUrl = url || `data:${documentType};base64,${doc}`;
    const containerClasses = `${styles.container} ${className}`;
    const downloadDocument = useDownload(fileName, fileAsUrl);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    const hasDocOrUrl = Boolean(url || doc)
    const [zoom, setZoom] = useState<ZoomState>(1);
    const [rotation, setRotation] = useState<Rotation>(initialRotation);
    const [pageCount, setPageCount] = useState<number | undefined>(undefined);

    // call onRotate callback when rotation changes
    useEffect(() => {
      onRotateCallback?.(rotation);
    }, [rotation]);

    useEffect(() => {
      // reset zoom and rotation when new document is loaded
      setZoom(1);
      setRotation(initialRotation);
    }, [doc]);

    const onZoomIn = (): void => {
      const currentZoomIndex = ZOOM_OPTIONS.findIndex(option => option === zoom)
      if (currentZoomIndex >= ZOOM_OPTIONS.length - 1) {
        return;
      } else {
        setZoom(ZOOM_OPTIONS[currentZoomIndex+1])
      }
    };

    const onZoomOut = (): void => {
      const currentZoomIndex = ZOOM_OPTIONS.findIndex(option => option === zoom)
      if (currentZoomIndex <= 0) {
        return;
      } 
      else {
        setZoom(ZOOM_OPTIONS[currentZoomIndex-1])
      }
    };

    const onRotateCW = (): void => {
      switch (rotation) {
        case 0:
          setRotation(90);
          break;
        case 90:
          setRotation(180);
          break;
        case 180:
          setRotation(270);
          break;
        case 270:
        default:
          setRotation(0);
          break;
      }
    };

    const onRotateCCW = (): void => {
      switch (rotation) {
        case 0:
          setRotation(270);
          break;
        case 90:
          setRotation(0);
          break;
        case 180:
          setRotation(90);
          break;
        case 270:
        default:
          setRotation(180);
          break;
      }
    };

    const moveUp = (): void => {
      if (!contentContainerRef.current) return;
      const el = contentContainerRef.current;
      const { height } = el.getBoundingClientRect();
      el.scrollBy({ top: -(height / 2), behavior: 'smooth' });
    };

    const moveDown = (): void => {
      if (!contentContainerRef.current) return;
      const el = contentContainerRef.current;
      const { height } = el.getBoundingClientRect();
      el.scrollBy({ top: height / 2, behavior: 'smooth' });
    };

    const moveLeft = (): void => {
      if (!contentContainerRef.current) return;
      const el = contentContainerRef.current;
      const { width } = el.getBoundingClientRect();
      el.scrollBy({ left: -(width / 2), behavior: 'smooth' });
    };

    const moveRight = (): void => {
      if (!contentContainerRef.current) return;
      const el = contentContainerRef.current;
      const { width } = el.getBoundingClientRect();
      el.scrollBy({ left: width / 2, behavior: 'smooth' });
    };

    useImperativeHandle(ref, () => ({
      onZoomIn,
      onZoomOut,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      onRotateCW,
      onRotateCCW,
    }));

    const firstZoomOption = ZOOM_OPTIONS[0];
    const lastZoomOption = ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]

    return (
      <div className={containerClasses}>
        <div className={styles.toolbar}>
          <div className={styles.mainGroup}>
            <div className={styles['toolbar-group']}>
              <span className={`${styles.button} ${zoom === firstZoomOption ? styles.disabled : ''}`} onClick={onZoomOut}>
                <FiZoomOut title="Zoom out" />
              </span>
              <span className={styles.info}>{Math.floor(zoom * 100)}%</span>
              <span className={`${styles.button} ${zoom === lastZoomOption ? styles.disabled : ''}`} onClick={onZoomIn}>
                <FiZoomIn title="Zoom in" />
              </span>
            </div>
            <div className={styles['toolbar-group']}>
              <span className={styles.button} onClick={onRotateCCW}>
                <FiRotateCcw title="Rotate counter clockwise" />
              </span>
              <span className={styles.button} onClick={onRotateCW}>
                <FiRotateCw title="Rotate clockwise" />
              </span>
            </div>
            <div className={styles['toolbar-group']}>
              <span className={styles.button} onClick={downloadDocument}>
                <FiDownload title="Download document" />
              </span>
            </div>
          </div>
          <div className={styles.pageCount}>{showPageCount && pageCount && <>{pageCount} pages</>}</div>
        </div>
        {loading ? (
          <div className={styles['loading-container']}>{loadingComponent}</div>
        ) : (
          <div className={styles['content-container']} ref={contentContainerRef}>
            {!loading && !hasDocOrUrl && <div className={styles['loading-container']}>Waiting for document...</div>}
            {!loading && hasDocOrUrl && isSimpleImage && (
              <SimpleImageViewer doc={fileAsUrl} zoom={zoom} rotation={rotation} containerRef={contentContainerRef} />
            )}
            {!loading && doc && isPDF && (
              <PDFViewer doc={doc} zoom={zoom} rotation={rotation} setPageCount={setPageCount} />
            )}
            {!loading && doc && isTIFF && <TIFFViewer doc={doc} zoom={zoom} />}
            {!loading && hasDocOrUrl && !documentType && 'Unsupported document format. Download to view locally.'}
          </div>
        )}
      </div>
    );
  }
);

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;
