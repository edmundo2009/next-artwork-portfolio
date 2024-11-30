// utils/artworkDataManager.ts
import fs from 'fs/promises';
import path from 'path';
import { Artwork, ArtworkDisplayType } from '@/types/artwork';

class ArtworkDataManager {
  // Paths to key directories and files
  private static readonly ARTWORK_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'artwork-description.ts');
  private static readonly PUBLIC_ARTWORK_DIR = path.join(process.cwd(), 'public', 'artwork');
  private static readonly PUBLIC_DESCRIPTIONS_DIR = path.join(process.cwd(), 'public', 'descriptions');

  /**
   * Read artwork data from the TypeScript file
   * @returns Array of Artwork objects
   */
  static async readArtworkData(): Promise<Artwork[]> {
    try {
      // Ensure directories exist
      await fs.mkdir(this.PUBLIC_ARTWORK_DIR, { recursive: true });
      await fs.mkdir(this.PUBLIC_DESCRIPTIONS_DIR, { recursive: true });

      // Read the file content
      const fileContent = await fs.readFile(this.ARTWORK_DATA_PATH, 'utf8');

      // Extract the array using a regex
      const match = fileContent.match(/export const mockArtworks: Artwork\[] = (\[[\s\S]*?\]);/);
      if (!match) {
        console.warn('No artwork data found, returning empty array');
        return [];
      }

      // Parse and return the artwork array
      return JSON.parse(match[1]);
    } catch (error) {
      console.error('Error reading artwork data:', error);
      return [];
    }
  }

  /**
   * Write artwork data to the TypeScript file
   * @param artworks Array of Artwork objects to write
   */
  static async writeArtworkData(artworks: Artwork[]) {
    try {
      const fileContent = `import { Artwork, ArtworkDisplayType } from '@/types/artwork';

export const mockArtworks: Artwork[] = ${JSON.stringify(artworks, null, 2)};`;

      await fs.writeFile(this.ARTWORK_DATA_PATH, fileContent);
    } catch (error) {
      console.error('Error writing artwork data:', error);
    }
  }

  /**
   * Save an uploaded image file
   * @param file File to save
   * @param year Year of the artwork
   * @returns Relative path to the saved image
   */
  static async saveImageFile(file: File, year: number): Promise<string> {
    try {
      // Create year-specific directory if it doesn't exist
      const yearDir = path.join(this.PUBLIC_ARTWORK_DIR, year.toString());
      await fs.mkdir(yearDir, { recursive: true });

      // Generate unique filename
      const filename = `${year}-${Date.now()}${path.extname(file.name)}`;
      const fullPath = path.join(yearDir, filename);

      // Convert File to buffer and write
      const buffer = await file.arrayBuffer();
      await fs.writeFile(fullPath, Buffer.from(buffer));

      // Return relative path
      return `/artwork/${year}/${filename}`;
    } catch (error) {
      console.error('Error saving image file:', error);
      return '';
    }
  }

  /**
   * Save artwork description as markdown file
   * @param title Artwork title
   * @param description Description text
   * @returns Relative path to the saved markdown file
   */
  static async saveDescriptionFile(title: string, description: string): Promise<string> {
    try {
      // Generate filename from title
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
      const fullPath = path.join(this.PUBLIC_DESCRIPTIONS_DIR, filename);

      // Write description to file
      await fs.writeFile(fullPath, description);

      // Return relative path
      return `/descriptions/${filename}`;
    } catch (error) {
      console.error('Error saving description file:', error);
      return '';
    }
  }

  /**
   * Read markdown description file
   * @param descriptionPath Relative path to the description file
   * @returns Description text or empty string
   */
  static async readDescriptionFile(descriptionPath: string): Promise<string> {
    try {
      const fullPath = path.join(process.cwd(), 'public', descriptionPath);
      return await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      console.error('Error reading description file:', error);
      return '';
    }
  }

  /**
   * Delete an artwork's associated files
   * @param artwork Artwork to delete
   */
  static async deleteArtworkFiles(artwork: Artwork) {
    try {
      // Delete image file if exists
      if (artwork.imageUrl) {
        const imagePath = path.join(process.cwd(), 'public', artwork.imageUrl);
        await fs.unlink(imagePath).catch(() => { });
      }

      // Delete description file if exists
      if (artwork.descriptionPath) {
        const descPath = path.join(process.cwd(), 'public', artwork.descriptionPath);
        await fs.unlink(descPath).catch(() => { });
      }
    } catch (error) {
      console.error('Error deleting artwork files:', error);
    }
  }
}

export default ArtworkDataManager;