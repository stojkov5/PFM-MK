// src/pages/Admin/news/prepareImage.js
// Photos straight from a camera or phone are far bigger than a web page needs.
// Before uploading, shrink large images in the browser so articles load fast
// and the database stays small.

const MAX_SIDE = 2000; // px, longest edge
const SKIP_BELOW = 400 * 1024; // files already this small are left alone

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const rename = (name, ext) => `${name.replace(/\.[^.]+$/, "")}.${ext}`;

export const prepareImage = async (file) => {
  // GIFs may be animated; a canvas would keep only the first frame.
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SKIP_BELOW) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps transparency and is the smallest. Browsers that can't write
  // WebP hand back a PNG instead; then fall back to JPEG for photos.
  let blob = await toBlob(canvas, "image/webp", 0.86);
  let ext = "webp";
  if (!blob || blob.type !== "image/webp") {
    if (file.type === "image/png") return file;
    blob = await toBlob(canvas, "image/jpeg", 0.88);
    ext = "jpg";
  }
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], rename(file.name, ext), { type: blob.type });
};
