const fallbackImage = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80';
const apiOrigin = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', window.location.origin).origin;

export default function getProductImageUrl(image) {
  if (!image) return fallbackImage;
  if (/^https?:\/\//i.test(image)) return image;
  return new URL(image, `${apiOrigin}/`).href;
}
