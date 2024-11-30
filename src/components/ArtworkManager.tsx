// components/ArtworkManager.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Artwork, ArtworkDisplayType } from '@/types/artwork';
import ArtworkDataManager from '@/utils/artworkDataManager';
import Image from 'next/image';

interface ArtworkManagerProps {
  onClose: () => void;
}

interface FormData {
  id?: string;
  year: number;
  imageUrl: string;
  title: string;
  type: ArtworkDisplayType;
  descriptionPath?: string;
  description: string;
  file?: File;
}

const ArtworkManager: React.FC<ArtworkManagerProps> = ({ onClose }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentArtwork, setCurrentArtwork] = useState<FormData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isNewArtwork, setIsNewArtwork] = useState(false);
  const [description, setDescription] = useState('');

  // Load artworks on component mount
  useEffect(() => {
    const loadArtworks = async () => {
      const loadedArtworks = await ArtworkDataManager.readArtworkData();
      setArtworks(loadedArtworks);
    };
    loadArtworks();
  }, []);

  // Load description when an artwork is selected
  useEffect(() => {
    const loadDescription = async () => {
      if (currentArtwork && !isNewArtwork && currentArtwork.descriptionPath) {
        const loadedDescription = await ArtworkDataManager.readDescriptionFile(currentArtwork.descriptionPath);
        setDescription(loadedDescription);
      } else {
        setDescription('');
      }
    };
    loadDescription();
  }, [currentArtwork, isNewArtwork]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const currentYear = currentArtwork?.year || new Date().getFullYear();

      if (currentArtwork) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
        setCurrentArtwork({
          ...currentArtwork,
          file,
          imageUrl: `/artwork/${currentYear}/${file.name}`
        });
      }
    }
  }, [currentArtwork]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const handleAddArtwork = () => {
    const newArtwork: FormData = {
      year: new Date().getFullYear(),
      imageUrl: '',
      title: 'New Artwork',
      type: ArtworkDisplayType.FullScreen,
      description: '',
      descriptionPath: ''
    };
    setCurrentArtwork(newArtwork);
    setIsNewArtwork(true);
    setPreviewUrl(null);
    setDescription('');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setCurrentArtwork({
      ...artwork,
      type: artwork.type,
      description: ''  // Will be loaded by useEffect
    });
    setIsNewArtwork(false);
    setPreviewUrl(artwork.imageUrl);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!currentArtwork) return;

    const { name, value } = e.target;

    // Special handling for description
    if (name === 'description') {
      setDescription(value);
      return;
    }

    setCurrentArtwork({
      ...currentArtwork,
      [name]: name === 'year' ? parseInt(value) : value,
      ...(name === 'year' && currentArtwork.file
        ? { imageUrl: `/artwork/${value}/${currentArtwork.file.name}` }
        : {})
    });
  };

  const handleSave = async () => {
    if (!currentArtwork) return;

    try {
      // 1. Save the image file if a new file is uploaded
      let imageUrl = currentArtwork.imageUrl;
      if (currentArtwork.file) {
        const originalFilename = currentArtwork.file.name;
        imageUrl = await ArtworkDataManager.saveImageFile(
          currentArtwork.file,
          currentArtwork.year,
          originalFilename  // Pass the original filename
        );
      }

      // 2. Save the markdown description
      let descriptionPath = '';
      if (description.trim()) {
        descriptionPath = await ArtworkDataManager.saveDescriptionFile(
          currentArtwork.title,
          description
        );
      }

      // 3. Update artwork object
      const updatedArtwork: Artwork = {
        id: isNewArtwork
          ? (currentArtwork.file
            ? currentArtwork.file.name.replace(/\.[^/.]+$/, '')
            : `artwork-${Date.now()}`
          ) : currentArtwork.id!,
        year: currentArtwork.year,
        imageUrl: imageUrl,
        title: currentArtwork.title,
        type: parseInt(currentArtwork.type as unknown as string) as ArtworkDisplayType,
        descriptionPath: descriptionPath
      };
      
      // 4. Update artwork list
      let newArtworks: Artwork[];
      if (isNewArtwork) {
        newArtworks = [...artworks, updatedArtwork];
      } else {
        newArtworks = artworks.map(art =>
          art.id === updatedArtwork.id ? updatedArtwork : art
        );
      }

      // 5. Save to data file
      await ArtworkDataManager.writeArtworkData(newArtworks);

      // 6. Update state
      setArtworks(newArtworks);
      setCurrentArtwork(null);
      setPreviewUrl(null);
      setIsNewArtwork(false);
      setDescription('');

    } catch (error) {
      console.error('Error saving artwork:', error);
      alert('Failed to save artwork. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const artworkToDelete = artworks.find(art => art.id === id);

    if (artworkToDelete) {
      // 1. Delete associated files
      await ArtworkDataManager.deleteArtworkFiles(artworkToDelete);

      // 2. Remove from artwork list
      const updatedArtworks = artworks.filter(art => art.id !== id);

      // 3. Save updated list
      await ArtworkDataManager.writeArtworkData(updatedArtworks);

      // 4. Update state
      setArtworks(updatedArtworks);
      setCurrentArtwork(null);
      setPreviewUrl(null);
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
              ${currentArtwork && (currentArtwork as any).id === artwork.id
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
            {/* Image Upload/Preview */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-600'}`}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <p>Drag & drop an image here or click to select</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4 ">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentArtwork.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md  border-gray-300 border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
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
                  <option value={ArtworkDisplayType.FullScreen}>Full Screen</option>
                  <option value={ArtworkDisplayType.SplitScreenTextLeft}>Split Screen Text Left</option>
                  <option value={ArtworkDisplayType.FullScreenWithOverlay}>Full Screen With Overlay</option>
                </select>
              </div>

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
                  value={currentArtwork.imageUrl}
                  readOnly
                  className="mt-1 block w-full rounded-md border-black bg-gray-50  px-2 py-1"
                />
              </div>

              <div className="flex justify-end space-x-4">
                {!isNewArtwork && (
                  <button
                    type="button"
                    onClick={() => handleDelete((currentArtwork as any).id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
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