import React, { useState, useEffect } from 'react';
import { Upload, Image, Trash2, Copy, ExternalLink, Search } from 'lucide-react';
import { imageUploadService } from '../services/imageUpload';
import type { UploadedImage } from '../services/imageUpload';
import toast from 'react-hot-toast';

const ThumbnailManager: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const uploadedImages = await imageUploadService.getUploadedImages();
      setImages(uploadedImages);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const uploadPromise = imageUploadService.uploadImage(file)
        .then((uploadedImage) => {
          setImages(prev => [uploadedImage, ...prev]);
          successCount++;
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          if (errorMessage.includes('size')) {
            toast.error(`${file.name} is too large (max 5MB)`);
          } else if (errorMessage.includes('image')) {
            toast.error(`${file.name} is not a valid image file`);
          }
          errorCount++;
        });
      
      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploaded successfully!`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} image(s) failed to upload`);
    }

    setIsUploading(false);
    // Reset file input
    event.target.value = '';
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await imageUploadService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    
    if (!window.confirm(`Delete ${selectedImages.size} selected image(s)?`)) return;

    let successCount = 0;
    let errorCount = 0;

    for (const imageId of selectedImages) {
      try {
        await imageUploadService.deleteImage(imageId);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
    setSelectedImages(new Set());

    if (successCount > 0) {
      toast.success(`${successCount} image(s) deleted successfully!`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} image(s) failed to delete`);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredImages = images
    .filter(img => img.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      }
    });

  return (
    <div className="bg-surface rounded-xl shadow-lg p-8 border border-secondary">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Image className="w-7 h-7 text-primary" />
          Thumbnail Manager
        </h2>
        <div className="flex items-center gap-4">
          {selectedImages.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/80 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedImages.size})
            </button>
          )}
          <label className={`bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 flex items-center gap-2 font-medium transition-all ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <Upload className="w-5 h-5" />
            {isUploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
            className="px-4 py-2 bg-background border border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-background rounded-lg p-4 border border-secondary">
          <div className="text-2xl font-bold text-primary">{images.length}</div>
          <div className="text-sm text-text-secondary">Total Images</div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-secondary">
          <div className="text-2xl font-bold text-green-400">{filteredImages.length}</div>
          <div className="text-sm text-text-secondary">Filtered Results</div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-secondary">
          <div className="text-2xl font-bold text-orange-400">
            {formatFileSize(images.reduce((total, img) => total + img.size, 0))}
          </div>
          <div className="text-sm text-text-secondary">Total Size</div>
        </div>
      </div>

      {/* Image Grid */}
      {isLoading ? null : filteredImages.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <Image className="w-20 h-20 mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No images found' : 'No images uploaded'}
          </h3>
          <p className="text-text-tertiary">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload your first image to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`bg-background rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                selectedImages.has(image.id)
                  ? 'border-primary shadow-lg shadow-primary/25'
                  : 'border-secondary hover:border-primary/50'
              }`}
            >
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(image.url)}
                    className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-secondary text-text-primary p-2 rounded-full hover:bg-secondary/80 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="bg-danger text-white p-2 rounded-full hover:bg-danger/80 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-text-primary text-sm truncate mb-1">
                  {image.name}
                </h4>
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{image.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThumbnailManager;
