// utils/imagePreloader.ts
export const preloadImage = (imageUrl?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  await Promise.all(imageUrls.map(preloadImage));
};