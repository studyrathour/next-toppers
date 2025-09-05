import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase/config';

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  size: number;
};

export const imageUploadService = {
  async uploadImage(file: File): Promise<UploadedImage> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, `thumbnails/${fileName}`);
      
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        id: fileName,
        name: file.name,
        url: downloadURL,
        uploadedAt: new Date(),
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error instanceof Error ? error : new Error('Failed to upload image');
    }
  },

  async getUploadedImages(): Promise<UploadedImage[]> {
    try {
      const thumbnailsRef = ref(storage, 'thumbnails');
      const result = await listAll(thumbnailsRef);
      
      const images = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await itemRef.getMetadata();
          
          return {
            id: itemRef.name,
            name: itemRef.name,
            url,
            uploadedAt: new Date(metadata.timeCreated),
            size: metadata.size || 0
          };
        })
      );
      
      return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      console.error('Error fetching uploaded images:', error);
      return [];
    }
  },

  async deleteImage(imageId: string): Promise<void> {
    try {
      const imageRef = ref(storage, `thumbnails/${imageId}`);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error instanceof Error ? error : new Error('Failed to delete image');
    }
  }
};
