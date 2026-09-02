export const DEFAULT_AVATAR = "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png";

export const isExternalImage = (url: string): boolean => {
  return url.includes("file.santosatechid.cloud") || url.includes("santosatechid.cloud") || (!url.startsWith("/") && !url.startsWith("data:"));
};

export const getSafeImageUrl = (url?: string | null): string => {
  if (!url) return DEFAULT_AVATAR;

  // If it's an external image that might timeout, use fallback
  if (isExternalImage(url)) {
    return url; // We'll handle timeout in the component
  }

  return url;
};

export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = src;
  });
};

export const createImageLoader = () => {
  const cache = new Map<string, boolean>();

  return async (src: string): Promise<string> => {
    // Check cache first
    if (cache.has(src)) {
      return cache.get(src) ? src : DEFAULT_AVATAR;
    }

    // Try to preload with timeout
    const loaded = await preloadImage(src);
    cache.set(src, loaded);

    return loaded ? src : DEFAULT_AVATAR;
  };
};
