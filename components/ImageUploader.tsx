
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file.');
      }
    }
  };

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setFileName(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageUpload]);

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-600 mb-3">{title}</h3>
      <div
        onClick={handleContainerClick}
        className="w-full h-64 relative flex justify-center items-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer overflow-hidden group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white text-sm px-2 text-center break-all">{fileName}</span>
            </div>
             <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-100 transition-colors"
              aria-label="Remove image"
            >
              <XCircleIcon />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon />
            <p className="mt-2 font-medium">Click to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
