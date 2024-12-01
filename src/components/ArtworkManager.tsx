// components/ArtworkManager.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Artwork, ArtworkDisplayType } from '@/types/artwork';
import ArtworkDataManager from '@/utils/artworkDataManager';
import Image from 'next/image';

interface ArtworkManagerProps {
  onClose: () => void;
  preSelectedArtwork?: Artwork | null; // for @/hooks/useArtworkManagerTrigger
}

interface FormData {
  id?: string;
  year: number;
  imageUrl: string | string[];
  title: string;
  type: ArtworkDisplayType;
  descriptionPath?: string;
  description: string;
  file?: File;
  files?: File[];
  textWidthPercentage?: number;
}

const ArtworkManager: React.FC<ArtworkManagerProps> = ({ onClose, preSelectedArtwork }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentArtwork, setCurrentArtwork] = useState<FormData | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isNewArtwork, setIsNewArtwork] = useState(false);
  const [description, setDescription] = useState('');
  const [imageSelection, setImageSelection] = useState<'single' | 'multiple'>('single');

  useEffect(() => {
    if (preSelectedArtwork) {
      const formData: FormData = {
        id: preSelectedArtwork.id,
        year: preSelectedArtwork.year,
        imageUrl: preSelectedArtwork.imageUrl,
        title: preSelectedArtwork.title,
        type: preSelectedArtwork.type,
        description: preSelectedArtwork.description || '',
        textWidthPercentage: preSelectedArtwork.textWidthPercentage,
      };
      setCurrentArtwork(formData);
      setDescription(preSelectedArtwork.description || '');
      setIsNewArtwork(false);

      setImageSelection(Array.isArray(preSelectedArtwork.imageUrl) ? 'multiple' : 'single');

      const urls = Array.isArray(preSelectedArtwork.imageUrl)
        ? preSelectedArtwork.imageUrl
        : [preSelectedArtwork.imageUrl];
      setPreviewUrls(urls);
    }
  }, [preSelectedArtwork]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!currentArtwork) return;

    const maxFiles = imageSelection === 'multiple' ? 3 : 1;
    if (acceptedFiles.length > maxFiles) {
      alert(`Please select up to ${maxFiles} ${maxFiles === 1 ? 'image' : 'images'}.`);
      return;
    }

    previewUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    const newPreviewUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);

    setCurrentArtwork((prev) => ({
      ...prev!,
      files: acceptedFiles,
      imageUrl: imageSelection === 'multiple' ? newPreviewUrls : newPreviewUrls[0],
    }));
  }, [currentArtwork, imageSelection, previewUrls]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: imageSelection === 'multiple',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArtwork) return;

    try {
      const formData = new FormData();
      formData.append('year', currentArtwork.year.toString());
      formData.append('title', currentArtwork.title);
      formData.append('type', currentArtwork.type.toString());
      formData.append('description', currentArtwork.description);

      if (currentArtwork.textWidthPercentage) {
        formData.append('textWidthPercentage', currentArtwork.textWidthPercentage.toString());
      }

      if (currentArtwork.files) {
        currentArtwork.files.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
        formData.append('fileCount', currentArtwork.files.length.toString());
      }

      if (currentArtwork.id) {
        formData.append('id', currentArtwork.id);
      }

      await ArtworkDataManager.saveArtwork(formData);
      onClose();
    } catch (error) {
      console.error('Error saving artwork:', error);
    }
  };

  const handleAddArtwork = () => {
    const newArtwork: FormData = {
      year: new Date().getFullYear(),
      imageUrl: '',
      title: 'New Artwork',
      type: ArtworkDisplayType.FullScreen,
      description: '',
      descriptionPath: '',
      textWidthPercentage: 50,
    };
    setCurrentArtwork(newArtwork);
    setIsNewArtwork(true);
    setPreviewUrls([]);
    setDescription('');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setCurrentArtwork({
      ...artwork,
      type: artwork.type,
      textWidthPercentage: artwork.textWidthPercentage || 50,
      description: '',
      files: Array.isArray(artwork.imageUrl)
        ? artwork.imageUrl.map((url) => ({ name: url.split('/').pop()!, type: 'image/jpeg' } as File))
        : undefined,
    });
    setIsNewArtwork(false);
    setPreviewUrls(Array.isArray(artwork.imageUrl) ? artwork.imageUrl : []);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!currentArtwork) return;

    const { name, value } = e.target;

    if (name === 'description') {
      setDescription(value);
      return;
    }

    const newType = name === 'type' ? parseInt(value) : currentArtwork.type;

    setCurrentArtwork({
      ...currentArtwork,
      [name]: name === 'year'
        ? parseInt(value)
        : name === 'textWidthPercentage'
        ? parseInt(value)
        : value,
      ...(name === 'type'
        ? {
          type: newType,
          textWidthPercentage: newType === ArtworkDisplayType.SplitScreenTextLeft
            ? 50
            : undefined,
        }
        : {}),
    });
  };

  const handleDelete = async (id: string) => {
    const artworkToDelete = artworks.find((art) => art.id === id);

    if (artworkToDelete) {
      await ArtworkDataManager.deleteArtworkFiles(artworkToDelete);

      const updatedArtworks = artworks.filter((art) => art.id !== id);

      await ArtworkDataManager.writeArtworkData(updatedArtworks);

      setArtworks(updatedArtworks);
      setCurrentArtwork(null);
      setPreviewUrls([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Artwork Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Artwork List */}
          <div className="col-span-1 border-r pr-4">
            <button
              onClick={handleAddArtwork}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
              Add New Artwork
            </button>
            <div className="space-y-2">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  onClick={() => handleEditArtwork(artwork)}
                  className={`p-3 rounded cursor-pointer 
                  ${currentArtwork && currentArtwork.id === artwork.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{artwork.title}</div>
                  <div className="text-sm text-gray-500">{artwork.year}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Form */}
          <div className="col-span-2 pl-4 text-black">
            {currentArtwork ? (
              <div className="space-y-4">
                {/* Radio Button for Image Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image Selection</label>
                  <div className="flex space-x-4">
                    <label>
                      <input
                        type="radio"
                        name="imageSelection"
                        value="single"
                        checked={imageSelection === 'single'}
                        onChange={() => setImageSelection('single')}
                        className="mr-2"
                      />
                      Single Image
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="imageSelection"
                        value="multiple"
                        checked={imageSelection === 'multiple'}
                        onChange={() => setImageSelection('multiple')}
                        className="mr-2"
                      />
                      Three Images
                    </label>
                  </div>
                </div>

                {/* Image Upload/Preview */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-600'}`}
                >
                  <input {...getInputProps()} />
                  {imageSelection === 'single' ? (
                    previewUrls.length > 0 ? (
                      <div className="relative h-48 w-full">
                        <Image
                          src={previewUrls[0]}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <p>Drag & drop an image here or click to select</p>
                    )
                  ) : (
                    previewUrls.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative h-48 w-full">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Drag & drop up to 3 images here or click to select</p>
                    )
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={currentArtwork.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={currentArtwork.year}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="type"
                      value={currentArtwork.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                    >
                      <option value={ArtworkDisplayType.FullScreen}>
                        Full Screen No Description
                      </option>
                      <option value={ArtworkDisplayType.FullScreenWithOverlay}>
                        Full Screen With Description Overlay
                      </option>
                      <option value={ArtworkDisplayType.SplitScreenTextLeft}>
                        Split Screen Text Left
                      </option>
                    </select>
                  </div>

                  {(currentArtwork.type === ArtworkDisplayType.SplitScreenTextLeft ||
                    (currentArtwork.textWidthPercentage !== undefined &&
                      currentArtwork.textWidthPercentage !== null)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Text Width Percentage
                      </label>
                      <select
                        name="textWidthPercentage"
                        value={currentArtwork.textWidthPercentage || 50}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                      >
                        <option value={20}>20%</option>
                        <option value={25}>25%</option>
                        <option value={30}>30%</option>
                        <option value={35}>35%</option>
                        <option value={40}>40%</option>
                        <option value={45}>45%</option>
                        <option value={50}>50%</option>
                        <option value={55}>55%</option>
                        <option value={60}>60%</option>
                        <option value={65}>65%</option>
                        <option value={70}>70%</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={description}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      value={Array.isArray(currentArtwork.imageUrl)
                        ? currentArtwork.imageUrl.join(', ')
                        : currentArtwork.imageUrl}
                      readOnly
                      className="mt-1 block w-full rounded-md border-black bg-gray-50  px-2 py-1"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    {!isNewArtwork && (
                      <button
                        type="button"
                        onClick={() => handleDelete(currentArtwork?.id ?? "")}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select an artwork to edit or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkManager;