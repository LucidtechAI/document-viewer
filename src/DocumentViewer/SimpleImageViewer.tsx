import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './SimpleImageViewer.module.css';
import { getRotationStyle, getZoomStyle, Rotation, ZoomState } from './';

type SimpleImageViewerProps = {
  doc: string;
  zoom?: ZoomState;
  rotation?: Rotation;
  containerRef?: React.RefObject<HTMLDivElement>;
};

const SimpleImageViewer = ({
  doc,
  zoom = 1,
  rotation = 0,
  containerRef,
}: SimpleImageViewerProps): JSX.Element | null => {
  const zoomStyle = getZoomStyle(zoom);
  const rotationStyle = getRotationStyle(rotation);
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState([0, 0]);
  const [rotationContainerStyles, setRotationContainerStyles] = useState({});
  const [originalWidth, originalHeight] = dimensions;

  useEffect(() => {
    const newImg = new Image();
    newImg.src = doc;
    newImg.onload = () => {
      setDimensions([newImg.width, newImg.height]);
    };
  }, [doc]);

  useLayoutEffect(() => {
    if (originalWidth === 0 || !imgRef.current || !containerRef?.current) return;
    const isWider = originalWidth > originalHeight;

    const diff = Math.abs(imgRef.current.clientWidth - imgRef.current.clientHeight);
    const newStyles: CSSProperties = {};

    if (rotation === 90 || rotation === 270) {
      if (isWider) {
        newStyles.marginTop = (diff * zoom) / 2;
        newStyles.marginBottom = (diff * zoom) / 2;
      } else {
        newStyles.marginLeft = diff / 2;
        newStyles.marginRight = diff / 2;
      }
    }

    setRotationContainerStyles(newStyles);
  }, [imgRef, rotation, setRotationContainerStyles, originalWidth, zoom]);

  return (
    <div className={`${zoomStyle}`}>
      <div style={rotationContainerStyles}>
        <img src={doc} className={`${styles.image} ${rotationStyle}`} alt="Document" ref={imgRef} />
      </div>
    </div>
  );
};

export default SimpleImageViewer;
