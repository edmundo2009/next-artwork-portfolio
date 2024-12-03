// components/ArtworkManager.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Artwork, ArtworkDisplayType, ArtworkCategoryType, ArtworkStyle } from '@/types/artwork';
import ArtworkDataManager from '@/utils/artworkDataManager';
import Image from 'next/image';
import { getCategoryName } from '@/utils/categoryMapper';
import { getTypeName } from '@/utils/typeMapper';

interface ArtworkManagerProps {
  onClose: () => void;
  preSelectedArtwork?: Artwork | null; // for @/hooks/useArtworkManagerTrigger
}

interface FormData {
  id?: string;
  category: ArtworkCategoryType;
  imageUrl: string;
  title: string;
  titleLine2?: string; // New property for the second line
  type: ArtworkDisplayType;
  descriptionPath?: string;
  description: string;
  textWidthPercentage?: number; // interface extension, keep this optional
  style?: ArtworkStyle; // New property for display style
  file?: File;
}

const ArtworkManager: React.FC<ArtworkManagerProps> = ({ onClose, preSelectedArtwork }) => {
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

  // Handle preSelectedArtwork when provided
  useEffect(() => {
    if (preSelectedArtwork) {
      const formData: FormData = {
        id: preSelectedArtwork.id,
        category: preSelectedArtwork.category,
        imageUrl: preSelectedArtwork.imageUrl,
        title: preSelectedArtwork.title,
        titleLine2: preSelectedArtwork.titleLine2,
        type: preSelectedArtwork.type,
        descriptionPath: preSelectedArtwork.descriptionPath,
        description: preSelectedArtwork.description || '',
        textWidthPercentage: preSelectedArtwork.textWidthPercentage,
        style: preSelectedArtwork.style,
      };
      setCurrentArtwork(formData);
      setPreviewUrl(preSelectedArtwork.imageUrl);
      setDescription(preSelectedArtwork.description || '');
      setIsNewArtwork(false);
    }
  }, [preSelectedArtwork]);


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
      const currentCategory = currentArtwork?.category;

      if (currentArtwork) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
        setCurrentArtwork({
          ...currentArtwork,
          file,
          imageUrl: `/artwork/${currentCategory}/${file.name}`
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

  //////////////////////////////////////////////////////////

  const handleAddArtwork = () => {
    const newArtwork: FormData = {
      category: ArtworkCategoryType.paintings,
      imageUrl: '',
      title: '',
      type: ArtworkDisplayType.FullScreen,
      description: 'if fullscreeen template, no markdown file created',
      descriptionPath: '',
      textWidthPercentage: 50 // Always include this
    };
    setCurrentArtwork(newArtwork);
    setIsNewArtwork(true);
    setPreviewUrl(null);
    setDescription('');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setCurrentArtwork({
      ...artwork,
      category: artwork.category,
      type: artwork.type,
      textWidthPercentage: artwork.textWidthPercentage,
      description: artwork.description || '',
      titleLine2: artwork.titleLine2 || '', // Ensure titleLine2 is initialized
      style: {
        ...artwork.style,
        typography: {
          ...artwork.style?.typography,
          title: {
            ...artwork.style?.typography?.title,
            size: artwork.style?.typography?.title?.size || '2xl',
            weight: artwork.style?.typography?.title?.weight || 'bold'
          }
        }
      }
    });
    setIsNewArtwork(false);
    setPreviewUrl(artwork.imageUrl);
    setDescription(artwork.description || '');
  };

  //////////////////////////////////////////////////////////

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

    const newType = name === 'type' ? parseInt(value) : currentArtwork.type;

    setCurrentArtwork({
      ...currentArtwork,
      [name]: name === 'category'
        ? parseInt(value) as ArtworkCategoryType
        : name === 'textWidthPercentage'
          ? parseInt(value)
          : value,
      ...(name === 'type'
        ? {
          type: newType,
          textWidthPercentage: newType === ArtworkDisplayType.SplitScreenTextLeft
            ? 50
            : undefined
        }
        : {}),
      ...(name === 'category' && currentArtwork.file
        ? { imageUrl: `/artwork/${value}/${currentArtwork.file.name}` }
        : {}),
      ...(name === 'titleLine2'
        ? { titleLine2: value }
        : {})
    });
  };

  //////////////////////////////////////////////////////////
  const handleStyleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!currentArtwork) return;

    const { name, value } = e.target;

    // Split the name to handle nested properties
    const keys = name.split('.');

    setCurrentArtwork(prev => {
      const updatedStyle = { ...prev!.style };

      if (keys.length > 1) {
        // Handle nested properties
        let nestedObj = updatedStyle;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!nestedObj[keys[i] as keyof typeof nestedObj]) {
            nestedObj[keys[i] as keyof typeof nestedObj] = {} as any;
          }
          nestedObj = nestedObj[keys[i] as keyof typeof nestedObj] as any;
        }
        nestedObj[keys[keys.length - 1] as keyof typeof nestedObj] = value as any;
      } else {
        // Handle top-level properties
        updatedStyle[name as keyof typeof updatedStyle] = value as any;
      }

      return {
        ...prev!,
        style: updatedStyle
      };
    });
  };




  
  //////////////////////////////////////////////////////////
  const handleSave = async () => {
    if (!currentArtwork) return;

    try {
      // 1. Save the image file if a new file is uploaded
      let imageUrl = currentArtwork.imageUrl;
      if (currentArtwork.file) {
        const originalFilename = currentArtwork.file.name;
        imageUrl = await ArtworkDataManager.saveImageFile(
          currentArtwork.file,
          currentArtwork.category,
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
        category: currentArtwork.category, 
        imageUrl: imageUrl,
        title: currentArtwork.title,
        titleLine2: currentArtwork.titleLine2, // Include the second line
        type: parseInt(currentArtwork.type as unknown as string) as ArtworkDisplayType,
        descriptionPath: descriptionPath,
        textWidthPercentage: currentArtwork.type === ArtworkDisplayType.SplitScreenTextLeft
          ? currentArtwork.textWidthPercentage || 50
          : undefined, // Only save for SplitScreenTextLeft
        style: currentArtwork.style

      };

      // 4. Update artwork list
      // let newArtworks: Artwork[];
      // if (isNewArtwork) {
      //   newArtworks = [...artworks, updatedArtwork];
      // } else {
      //   newArtworks = artworks.map(art =>
      //     art.id === updatedArtwork.id ? updatedArtwork : art
      //   );
      // }

      // this makes single click update from the list
      const existingArtworks: Artwork[] = await ArtworkDataManager.readArtworkData();

      let newArtworks: Artwork[];
      if (isNewArtwork) {
        newArtworks = [...existingArtworks, updatedArtwork];
      } else {
        newArtworks = existingArtworks.map(art =>
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

  //////////////////////////////////////////////////////////
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
      <button onClick={onClose} className="text-gray-600 hover:text-gray-900" >
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
              {/* <div className="text-sm text-gray-500">{getCategoryName(artwork.category)}</div> */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{getCategoryName(artwork.category)}</span>
                <span className="text-blue-500 mx-2">{getTypeName(artwork.type)}</span>
                <span className="text-gray-600">{artwork.imageUrl.split('/').pop()}</span>
              </div>
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
                <label className="label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentArtwork?.title || ''}
                  onChange={handleInputChange}
                  className="field"
                />
              </div>
              <div>
                <label className="label">Title Line 2</label>
                <input
                  type="text"
                  name="titleLine2"
                  value={currentArtwork?.titleLine2 || ''}
                  onChange={handleInputChange}
                  className="field"
                />
              </div>

            <div className=" rounded-lg space-y-4 mt-4">
              {/* <h3 className="text-lg font-semibold">Display Style</h3> */}

              <div className="flex space-x-4">
                <div className="flex-1 rounded">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full border rounded p-2"
                    value={currentArtwork?.category || ''}
                    onChange={handleInputChange}
                    name="category"
                  >
                  <option value={ArtworkCategoryType.drawings}>1.Drawings</option>
                  <option value={ArtworkCategoryType.installations}>2.Installations</option>
                  <option value={ArtworkCategoryType.paintings}>3.Paintings</option>
                  <option value={ArtworkCategoryType.video}>4.Video</option>
                </select>
              </div>


              <div className="flex-1 rounded">
                <label className=" text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border rounded p-2"
                  value={currentArtwork?.type || ''}
                  onChange={handleInputChange}
                  name="type"
                >
                  <option value={ArtworkDisplayType.FullScreen}>Full Screen + Title</option>
                  <option value={ArtworkDisplayType.FullScreen2}>Full Screen With Description Overlay</option>
                  <option value={ArtworkDisplayType.SplitScreenTextLeft}>Split Screen Text Left</option>
                </select>
              </div>
            </div>



              {currentArtwork.type === ArtworkDisplayType.SplitScreenTextLeft && (
              <div>
                <label className="label">Text Width Percentage</label>
                <select
                  name="textWidthPercentage"
                  value={currentArtwork.textWidthPercentage || ''}
                  onChange={handleInputChange}
                  className="field"
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

              {currentArtwork.type !== ArtworkDisplayType.FullScreen && (
              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  rows={4}
                  className="field"
                />
              </div>
              )}

              {/* Text Placement */}
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <select
                  className="w-full border rounded p-2"
                  value={currentArtwork.style?.textPlacement || 'bottom-left'}
                  onChange={(e) => {
                    setCurrentArtwork(prev => ({
                      ...prev!,
                      style: {
                        ...prev!.style,
                        textPlacement: e.target.value as any
                      }
                    }));
                  }}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              {/* Text Color */}
              {/* <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="white, black, or tailwind color (e.g., green-500)"
                  value={currentArtwork.style?.textColor || ''}
                  onChange={(e) => {
                    setCurrentArtwork(prev => ({
                      ...prev!,
                      style: {
                        ...prev!.style,
                        textColor: e.target.value
                      }
                    }));
                  }}
                />
              </div> */}

              {/* Background Opacity */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Background Opacity ({currentArtwork.style?.bgOpacity || 0.5})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  value={currentArtwork.style?.bgOpacity || 0.5}
                  onChange={(e) => {
                    setCurrentArtwork(prev => ({
                      ...prev!,
                      style: {
                        ...prev!.style,
                        bgOpacity: parseFloat(e.target.value)
                      }
                    }));
                  }}
                />
              </div>
{/* 
              <div>
                <label className="block text-sm font-medium mb-1">Title Font Size</label>
                <select
                  className="w-full border rounded p-2"
                  value={currentArtwork?.style?.typography?.title?.size || '2xl'}
                  onChange={handleStyleChange}
                  name="typography.title.size" // Correct name for nested property
                >
                  <option value="xs">Extra Small</option>
                  <option value="sm">Small</option>
                  <option value="base">Base</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                  <option value="2xl">2XL</option>
                  <option value="3xl">3XL</option>
                  <option value="4xl">4XL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title Font Weight</label>
                <select
                  className="w-full border rounded p-2"
                  value={currentArtwork?.style?.typography?.title?.weight || 'bold'}
                  onChange={handleStyleChange}
                  name="typography.title.weight" // Correct name for nested property
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="extrabold">Extra Bold</option>
                </select>
              </div> */}

                <div className="flex space-x-4">
                  <div className="flex-1  rounded">
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="white, black, or tailwind color (e.g., green-500)"
                      value={currentArtwork?.style?.textColor || ''}
                      onChange={handleStyleChange}
                      name="textColor"
                    />
                  </div>
                  <div className="flex-1  rounded">
                    <label className="label">Title Font Size</label>
                    <select
                      className="field"
                      // value={currentArtwork?.style?.size || '2xl'}
                      value={currentArtwork?.style?.typography?.title?.size || '2xl'}

                      onChange={handleStyleChange}
                      name="typography.title.size" // Correct name for nested property
                    >
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="base">Base</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="2xl">2XL</option>
                      <option value="3xl">3XL</option>
                      <option value="4xl">4XL</option>
                    </select>
                  </div>

                  <div className="flex-1 rounded">
                    <label className="label">Title Font Weight</label>
                    <select
                      className="field"
                          value={currentArtwork?.style?.typography?.title?.weight || 'bold'}
                      onChange={handleStyleChange}
                      name="typography.title.weight" // Correct name for nested property
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                      <option value="extrabold">Extra Bold</option>
                    </select>
                  </div>
                </div>
              </div>
          
              
              <div>
                <label className="label">Image URL</label>
                <input type="text"
                  value={currentArtwork.imageUrl}
                  readOnly
                  className="mt-1 block w-full rounded-md border-black bg-gray-50  px-2 py-1"
                />
              </div>

              <div className="flex justify-end space-x-4">
                {!isNewArtwork && (
                  <button type="button"
                    onClick={() => handleDelete(currentArtwork?.id ?? "")}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button type="button"
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