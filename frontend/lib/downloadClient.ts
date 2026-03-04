import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

type Quality = "high" | "medium" | "low";

const QUALITY_MAP: Record<Quality, number> = {
  high: 0.9,
  medium: 0.7,
  low: 0.5
};

export async function buildZip(pages: string[], filename: string, quality: Quality) {
  const zip = new JSZip();
  let index = 1;
  for (const url of pages) {
    const { blob, ext } = await fetchAsWebp(url, QUALITY_MAP[quality]);
    const padded = String(index).padStart(4, "0");
    zip.file(`${padded}.${ext}`, blob);
    index += 1;
  }
  const content = await zip.generateAsync({ type: "blob" });
  triggerDownload(content, filename);
}

export async function buildPdf(pages: string[], filename: string) {
  const pdf = await PDFDocument.create();
  for (const url of pages) {
    const res = await fetch(url);
    const bytes = await res.arrayBuffer();
    const mime = res.headers.get("content-type") || "image/jpeg";
    const image = mime.includes("png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const pdfBytes = await pdf.save();
  const array = Uint8Array.from(pdfBytes);
  triggerDownload(new Blob([array], { type: "application/pdf" }), filename);
}

async function fetchAsWebp(url: string, quality: number) {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob, ext: blob.type.includes("png") ? "png" : "jpg" };
  ctx.drawImage(bitmap, 0, 0);
  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!webpBlob) return { blob, ext: blob.type.includes("png") ? "png" : "jpg" };
  return { blob: webpBlob, ext: "webp" };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
