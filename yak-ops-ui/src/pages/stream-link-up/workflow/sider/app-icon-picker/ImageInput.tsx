'use client';

import type { ChangeEvent, FC } from 'react';
import { createRef, useEffect, useState } from 'react';
import Cropper, { type Area, type CropperProps } from 'react-easy-crop';

// import { ImagePlus } from '../icons/src/vender/line/images'
import { useDraggableUploader } from './hooks';
import { checkIsAnimatedImage } from './utils';

import { ImagePlus } from '../emoji-picker/images';

export type OnImageInput = {
  (isCropped: true, tempUrl: string, croppedAreaPixels: Area, fileName: string): void;
  (isCropped: false, file: File): void;
};

const ALLOW_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

type UploaderProps = {
  display?: boolean;
  cropShape?: CropperProps['cropShape'];
  onImageInput?: OnImageInput;
};

const ImageInput: FC<UploaderProps> = ({ display, cropShape, onImageInput }) => {
  const [inputImage, setInputImage] = useState<{ file: File; url: string }>();
  const [isAnimatedImage, setIsAnimatedImage] = useState<boolean>(false);
  useEffect(() => {
    return () => {
      if (inputImage) URL.revokeObjectURL(inputImage.url);
    };
  }, [inputImage]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = async (_: Area, croppedAreaPixels: Area) => {
    if (!inputImage) return;
    onImageInput?.(true, inputImage.url, croppedAreaPixels, inputImage.file.name);
  };

  const handleLocalFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputImage({ file, url: URL.createObjectURL(file) });
      checkIsAnimatedImage(file).then((isAnimatedImage) => {
        setIsAnimatedImage(!!isAnimatedImage);
        if (isAnimatedImage) onImageInput?.(false, file);
      });
    }
  };

  const { isDragActive, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useDraggableUploader((file: File) => setInputImage({ file, url: URL.createObjectURL(file) }));

  const inputRef = createRef<HTMLInputElement>();

  const handleShowImage = () => {
    if (isAnimatedImage) {
      return <img src={inputImage?.url} alt="" />;
    }

    return (
      <Cropper
        image={inputImage?.url}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape={cropShape}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
    );
  };

  return (
    <div
      style={{
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        paddingTop: '0.375rem',
        paddingBottom: '0.375rem',
        width: '100%',
        display: display === true ? 'block' : "none",
      }}
    >
      <div
        // className={classNames(
        //   isDragActive && 'border-primary-600',
        //   'relative aspect-square bg-gray-50 border-[1.5px] border-gray-200 border-dashed rounded-lg flex flex-col justify-center items-center text-gray-500')}

        style={{
          borderColor: 'rgb(234 236 240)',
          borderStyle: 'dashed',
          borderWidth: '1.5px',
          borderRadius: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          aspectRatio: '1/1',
          position: 'relative',
          backgroundColor: 'rgb(249 250 251)',
          color: 'rgb(102 112 133)',
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!inputImage ? (
          <>
            <ImagePlus
              style={{
                height: '30px',
                width: '30px',
                marginBottom: '0.75rem',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                marginBottom: '2px',
              }}
            >
              <span style={{ pointerEvents: 'none' }}>Drop your image here, or&nbsp;</span>
              <button
                style={{ cursor: 'pointer', color: 'hsl(231 48% 48%)', border: 'none', backgroundColor: "rgb(249, 250, 251)" }}
                onClick={() => inputRef.current?.click()}
              >
                browse
              </button>
              <input
                ref={inputRef}
                type="file"
                style={{
                  lineHeight: '1rem',
                  fontSize: '0.75rem',
                  pointerEvents: 'none',
                  display: 'none',
                }}
                onClick={(e) => ((e.target as HTMLInputElement).value = '')}
                accept={ALLOW_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                onChange={handleLocalFileInput}
              />
            </div>
            <div style={{fontSize: 13}}>Supports PNG, JPG, JPEG, WEBP and GIF</div>
          </>
        ) : (
          handleShowImage()
        )}
      </div>
    </div>
  );
};

export default ImageInput;
