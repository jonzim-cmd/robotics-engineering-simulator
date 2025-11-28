const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const assetPath = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
};

export { basePath };
