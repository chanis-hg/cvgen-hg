import { LIMITS } from "../data/model";

export const PHOTO_SIZE = 400;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_PIXELS = 40_000_000;
const QUALITIES = [0.8, 0.6, 0.4];

export function fitSize(width, height, target = PHOTO_SIZE) {
  const side = Math.min(width, height);
  const scale = Math.min(1, target / side);
  return {
    side: Math.round(side * scale),
    sx: (width - side) / 2,
    sy: (height - side) / 2,
    sourceSide: side,
  };
}

export function exceedsPixels(width, height) {
  return width * height > MAX_PIXELS;
}

function drawSquare(img) {
  const { side, sx, sy, sourceSide } = fitSize(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, side, side);
  context.drawImage(img, sx, sy, sourceSide, sourceSide, 0, 0, side, side);
  return canvas;
}

export function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("type"));
    if (file.size > MAX_FILE_BYTES) return reject(new Error("size"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    const finish = (settle, value) => {
      img.onload = null;
      img.onerror = null;
      img.src = "";
      URL.revokeObjectURL(url);
      settle(value);
    };
    img.onload = () => {
      try {
        if (!img.naturalWidth || !img.naturalHeight) throw new Error("read");
        if (exceedsPixels(img.naturalWidth, img.naturalHeight)) throw new Error("pixels");
        const canvas = drawSquare(img);
        for (const quality of QUALITIES) {
          const result = canvas.toDataURL("image/jpeg", quality);
          if (result.length <= LIMITS.photoChars) return finish(resolve, result);
        }
        throw new Error("size");
      } catch (error) {
        const known = ["pixels", "size"].includes(error.message);
        finish(reject, known ? error : new Error("read"));
      }
    };
    img.onerror = () => finish(reject, new Error("read"));
    img.src = url;
  });
}
