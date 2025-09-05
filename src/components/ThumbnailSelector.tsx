import React, { useState, useEffect } from 'react';
import { Upload, X, Image, Link, Trash2, Check } from 'lucide-react';
import { imageUploadService } from '../services/imageUpload';
import type { UploadedImage } from '../services/imageUpload';
import toast from 'react-hot-toast';

interface ThumbnailSelectorProps {
  currentThumbnail: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  title?: string;
}

export const ThumbnailSelector: React.FC<ThumbnailSelectorProps> = ({
  currentThumbnail,
  onSelect,
  onClose,
  title = 'Select Thumbnail'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'gallery'>('gallery');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>(currentThumbnail);

  useEffect(() => {
    loadUploadedImages();
  }, []);

  const loadUploadedImages = async () => {
    try {
      const images = await imageUploadService.getUploadedImages();
      setUploadedImages(images);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    try {
      const uploadedImage = await imageUploadService.uploadImage(file);
      setUploadedImages(prev => [uploadedImage, ...prev]);
      setSelectedImage(uploadedImage.url);
      toast.success('Image uploaded successfully!');
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await imageUploadService.deleteImage(imageId);
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(urlInput.trim());
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setSelectedImage(urlInput.trim());
    toast.success('URL added successfully');
  };

  const handleSelect = () => {
    onSelect(selectedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-secondary">
        <div className="flex items-center justify-between p-6 border-b border-secondary">
          <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-secondary">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Image className="w-4 h-4 inline mr-2" />
            Gallery ({uploadedImages.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload New
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            URL
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'gallery' && (
            <div>
              {uploadedImages.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No images uploaded yet</p>
                  <p className="text-sm">Upload your first image to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image.url
                          ? 'border-primary shadow-lg shadow-primary/25'
                          : 'border-secondary hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                          className="bg-danger text-white p-2 rounded-full hover:bg-danger/80 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {selectedImage === image.url && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <div className="border-2 border-dashed border-secondary rounded-xl p-12 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="imageUpload"
                  disabled={isLoading}
                />
                <label htmlFor="imageUpload" className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                  <p className="text-xl font-medium text-text-secondary mb-2">
                    {isLoading ? 'Uploading...' : 'Upload Image'}
                  </p>
                  <p className="text-text-tertiary">
                    Click to select or drag and drop
                  </p>
                  <p className="text-sm text-text-tertiary mt-2">
                    Supports: JPG, PNG, GIF (Max 5MB)
                  </p>
                  {isLoading && (
                    <div className="mt-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Image URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 bg-background border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>
              {urlInput && (
                <div className="mt-4">
                  <p className="text-sm text-text-secondary mb-2">Preview:</p>
                  <div className="relative">
                    <img
                      src={urlInput}
                      alt="URL Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-secondary"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        toast.error('Invalid image URL');
                      }}
                      onLoad={() => {
                        (document.querySelector('.url-preview-error') as HTMLElement)?.remove();
                      }}
                    />
                    <div className="url-preview-error hidden absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg">
                      <p className="text-text-secondary text-sm">Invalid image URL</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedImage && (
          <div className="border-t border-secondary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-16 h-16 object-cover rounded-lg border border-secondary"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">Selected Image</p>
                  <p className="text-xs text-text-tertiary truncate max-w-xs">
                    {selectedImage}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelect}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Select Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
