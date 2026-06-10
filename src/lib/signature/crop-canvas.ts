// Client-side cropping helpers used by SignatureCropper. react-easy-crop
// reports the crop region in pixels of the *natural* image, then we use
// a canvas to extract that region into a Blob the server can ingest.

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Render the cropped region into a fresh canvas and return as a Blob.
 * Output is sized to a max width so the upload stays small while keeping
 * the signature's horizontal aspect intact.
 */
export async function getCroppedBlob(
  imageSrc: string,
  area: PixelArea,
  outputMaxWidth = 1200,
  mimeType: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const scale = Math.min(1, outputMaxWidth / area.width);
  const outW = Math.round(area.width * scale);
  const outH = Math.round(area.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, outW, outH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null.'))),
      mimeType,
      quality,
    );
  });
}
