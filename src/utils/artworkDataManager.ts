// src/utils/artworkDataManager.ts
import { Artwork } from '@/types/artwork';

class ArtworkDataManager {
  private static async apiRequest(operation: string, data?: FormData | object, method: 'GET' | 'POST' = 'POST') {
    const url = new URL(`/api/artwork?operation=${operation}`, window.location.href);
    let options: RequestInit;

    if (method === 'GET') {
      if (data && !(data instanceof FormData)) {
        for (const [key, value] of Object.entries(data)) {
          url.searchParams.append(key, value.toString());
        }
      }
      options = { method };
    } else {
      options = {
        method,
        body: data instanceof FormData ? data : JSON.stringify(data),
      };

      if (!(data instanceof FormData)) {
        options.headers = { 'Content-Type': 'application/json' };
      }
    }

    try {
      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${operation}):`, error);
      throw error;
    }
  }

  static async readArtworkData(): Promise<Artwork[]> {
    try {
      const data = await this.apiRequest('read', undefined, 'GET');

      if (!Array.isArray(data)) {
        console.error('Received invalid data format:', data);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error reading artwork data:', error);
      return [];
    }
  }

  static async writeArtworkData(artworks: Artwork[]): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('artworks', JSON.stringify(artworks));

      const { success } = await this.apiRequest('write', formData, 'POST');
      return success;
    } catch (error) {
      console.error('Error writing artwork data:', error);
      return false;
    }
  }

  static async saveImageFile(files: File[], year: number, title: string): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('year', year.toString());
      formData.append('title', title);

      const { paths } = await this.apiRequest('upload-image', formData);
      return paths;
    } catch (error) {
      console.error('Error saving image file:', error);
      return [];
    }
  }

  static async saveDescriptionFile(title: string, description: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', description);

      const { path } = await this.apiRequest('save-description', formData);
      return path;
    } catch (error) {
      console.error('Error saving description file:', error);
      return '';
    }
  }

  static async readDescriptionFile(descriptionPath: string): Promise<string> {
    try {
      const { content } = await this.apiRequest('read-description', { path: descriptionPath }, 'GET');
      return content;
    } catch (error) {
      console.error('Error reading description file:', error);
      return '';
    }
  }

  static async saveArtwork(formData: FormData): Promise<void> {
    const response = await this.apiRequest('save', formData);
    if (!response.success) {
      throw new Error('Failed to save artwork');
    }
  }

  static async deleteArtworkFiles(artwork: Artwork): Promise<void> {
    try {
      const imageUrls = Array.isArray(artwork.imageUrl) ? artwork.imageUrl : [artwork.imageUrl];
      for (const imageUrl of imageUrls) {
        await this.apiRequest('deleteFile', { path: imageUrl });
      }
      
      if (artwork.descriptionPath) {
        await this.apiRequest('deleteFile', { path: artwork.descriptionPath });
      }
    } catch (error) {
      console.error('Error deleting artwork files:', error);
      throw error;
    }
  }
}

export default ArtworkDataManager;
