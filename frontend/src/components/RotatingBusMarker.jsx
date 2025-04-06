import React, { useEffect, useRef } from "react";
import { Marker } from "react-leaflet";

const RotatingBusMarker = ({
  position,
  icon,
  rotationAngle,
  rotationOrigin,
  zIndexOffset,
}) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current;
      marker.setRotationAngle(rotationAngle);
    }
  }, [rotationAngle]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      rotationAngle={rotationAngle}
      rotationOrigin={rotationOrigin}
      zIndexOffset={zIndexOffset}
    />
  );
};

export default RotatingBusMarker;
