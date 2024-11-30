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

  static async saveImageFile(file: File, year: number): Promise<string> {
    try {
      // Preserve the original filename when saving
      const originalFilename = file.name;
      const filePath = `/artwork/${year}/${originalFilename}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', year.toString());

      const { path } = await this.apiRequest('upload-image', formData);
      return filePath;
      // return path;
    } catch (error) {
      console.error('Error saving image file:', error);
      return '';
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

  static async deleteArtworkFiles(artwork: Artwork): Promise<void> {
    try {
      const formData = new FormData();
      if (artwork.imageUrl) {
        formData.append('imageUrl', artwork.imageUrl);
      }
      if (artwork.descriptionPath) {
        formData.append('descriptionPath', artwork.descriptionPath);
      }

      await this.apiRequest('delete-files', formData);
    } catch (error) {
      console.error('Error deleting artwork files:', error);
    }
  }
}

export default ArtworkDataManager;