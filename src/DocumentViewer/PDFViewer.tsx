import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import styles from './PDFViewer.module.css';
import { debounce, Rotation } from './';
import { ZoomState } from './';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const options = {
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

type PDFViewerProps = {
  doc: string;
  zoom?: ZoomState;
  rotation?: Rotation;
  setPageCount: (pages: number) => void;
};

const PDFViewer = ({ doc, zoom = 1, rotation = 0, setPageCount }: PDFViewerProps): JSX.Element => {
  const [pages, setPages] = useState<null | number>(null);
  const [width, setWidth] = useState(600);
  const [internalPDFRotation, setInternalPDFRotation] = useState<number>(0);

  function onDocumentLoadSuccess(pdfProxy: pdfjs.PDFDocumentProxy) {
    pdfProxy.getPage(1).then((page) => setInternalPDFRotation(page.rotate));
    setPageCount(pdfProxy.numPages);
    setPages(pdfProxy.numPages);
  }

  const docContainerRef = useRef<HTMLElement | null>(null);

  const docBinary = useMemo(() => {
    const docBinary = atob(doc || '');
    return { data: docBinary };
  }, [doc]);

  useLayoutEffect(() => {
    if (docContainerRef.current) {
      const containerWidth = docContainerRef.current.getBoundingClientRect().width;
      setWidth(containerWidth);
    }
  }, []);

  useLayoutEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      if (docContainerRef.current) {
        const containerWidth = docContainerRef.current.getBoundingClientRect().width;
        setWidth(containerWidth);
      }
    }, 30);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  const pageClass = rotation ? `${styles.page} ${styles[`rotate${rotation}`]}` : styles.page;

  return (
    <Document
      file={docBinary}
      onLoadSuccess={onDocumentLoadSuccess}
      onSourceSuccess={() => setPages(null)}
      loading={null}
      options={options}
      inputRef={(ref: any) => (docContainerRef.current = ref)}
      rotate={rotation !== 0 ? rotation + internalPDFRotation : undefined}
      className={styles.document}
    >
      {[...new Array(pages)].map((_page, pageIndex) => {
        return (
          <Page
            pageIndex={pageIndex}
            width={width}
            key={pageIndex}
            className={pageClass}
            scale={zoom}
            renderTextLayer={rotation === 0 || rotation === 180}
          />
        );
      })}
    </Document>
  );
};

export default PDFViewer;
