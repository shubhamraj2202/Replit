import { useRef, useCallback } from 'react';

export function useCamera() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const openCamera = useCallback(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }, []);

  const openGallery = useCallback(() => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  }, []);

  const CameraInput = ({ onCapture }: { onCapture: (file: File) => void }) => (
    <input
      ref={cameraInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onCapture(file);
          e.target.value = '';
        }
      }}
    />
  );

  const GalleryInput = ({ onSelect }: { onSelect: (file: File) => void }) => (
    <input
      ref={galleryInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onSelect(file);
          e.target.value = '';
        }
      }}
    />
  );

  return {
    openCamera,
    openGallery,
    CameraInput,
    GalleryInput
  };
}