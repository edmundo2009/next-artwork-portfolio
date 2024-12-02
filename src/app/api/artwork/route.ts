// src/app/api/artwork/route.ts
// server-side API route
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Artwork } from '@/types/artwork';

// Resolve paths relative to the project root
const projectRoot = path.resolve(process.cwd());
const ARTWORK_DATA_PATH = path.join(projectRoot, 'src', 'data', 'artwork-description.ts');
const PUBLIC_ARTWORK_DIR = path.join(projectRoot, 'public', 'artwork');
const PUBLIC_DESCRIPTIONS_DIR = path.join(projectRoot, 'public', 'descriptions');

async function readArtworkData(): Promise<Artwork[]> {
  try {
    const fileContent = await fs.readFile(ARTWORK_DATA_PATH, 'utf8');
    const match = fileContent.match(/export const mockArtworks: Artwork\[] = (\[[\s\S]*?\]);/);
    if (!match) return [];
    return JSON.parse(match[1]);
  } catch (error) {
    console.error('Error reading artwork data:', error);
    return [];
  }
}

async function writeArtworkData(artworks: Artwork[]): Promise<boolean> {
  try {
    const fileContent = `import { Artwork} from '@/types/artwork';

export const mockArtworks: Artwork[] = ${JSON.stringify(artworks, null, 2)};`;
    await fs.writeFile(ARTWORK_DATA_PATH, fileContent);
    return true;
  } catch (error) {
    console.error('Error writing artwork data:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get('operation');

  switch (operation) {
    case 'read':
      try {
        const artworks = await readArtworkData();
        return NextResponse.json(artworks, { status: 200 });
      } catch (error) {
        console.error('Error in read operation:', error);
        return NextResponse.json({ error: 'Failed to read artwork data' }, { status: 500 });
      }

    case 'read-description':
      try {
        const descPath = searchParams.get('path');
        if (!descPath) {
          return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }
        const fullPath = path.join(projectRoot, 'public', descPath);
        const content = await fs.readFile(fullPath, 'utf8');
        return NextResponse.json({ content }, { status: 200 });
      } catch (error) {
        console.error('Error reading description file:', error);
        return NextResponse.json({ error: 'Failed to read description file' }, { status: 500 });
      }

    default:
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get('operation');
  const data = await request.formData();

  switch (operation) {
    case 'write':
      try {
        const artworksJson = data.get('artworks') as string;
        const artworks = JSON.parse(artworksJson);
        const success = await writeArtworkData(artworks);
        return NextResponse.json({ success }, { status: 200 });
      } catch (error) {
        console.error('Error writing artwork data:', error);
        return NextResponse.json({ error: 'Failed to write artwork data' }, { status: 500 });
      }

    case 'upload-image':
      try {
        const file = data.get('file') as File;
        const category = data.get('category') as string;

        if (!file) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const categoryDir = path.join(PUBLIC_ARTWORK_DIR, category);
        await fs.mkdir(categoryDir, { recursive: true });

        //  server-side API route for image upload
        const filename = data.get('filename') as string;
        const newPath = path.join(categoryDir, filename);

        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(newPath, Buffer.from(arrayBuffer));

        return NextResponse.json({ path: `/artwork/${category}/${filename}` }, { status: 200 });
      } catch (error) {
        console.error('Error saving image file:', error);
        return NextResponse.json({ error: 'Failed to save image file' }, { status: 500 });
      }

    case 'save-description':
      try {
        const title = data.get('title') as string;
        const content = data.get('content') as string;

        if (!title || !content) {
          return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
        }

        const filename = `${title}.md`.toLowerCase().replace(/\s+/g, '-');
        const descPath = path.join(PUBLIC_DESCRIPTIONS_DIR, filename);

        await fs.mkdir(PUBLIC_DESCRIPTIONS_DIR, { recursive: true });
        await fs.writeFile(descPath, content);

        return NextResponse.json({ path: `/descriptions/${filename}` }, { status: 200 });
      } catch (error) {
        console.error('Error saving description file:', error);
        return NextResponse.json({ error: 'Failed to save description file' }, { status: 500 });
      }

    case 'delete-files':
      try {
        const imageUrl = data.get('imageUrl') as string;
        const descriptionPath = data.get('descriptionPath') as string;

        if (imageUrl) {
          const imagePath = path.join(projectRoot, 'public', imageUrl);
          try {
            await fs.unlink(imagePath);
          } catch (unlinkErr) {
            console.error('Error deleting image:', unlinkErr);
          }
        }

        if (descriptionPath) {
          const descPath = path.join(projectRoot, 'public', descriptionPath);
          try {
            await fs.unlink(descPath);
          } catch (unlinkErr) {
            console.error('Error deleting description:', unlinkErr);
          }
        }

        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error('Error during file deletion:', error);
        return NextResponse.json({ error: 'Failed to delete files' }, { status: 500 });
      }

    default:
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  }
}
