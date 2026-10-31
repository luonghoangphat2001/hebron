import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { SNAP_THRESHOLD } from '../constants/canvas-editor.constant';
import type { ExportCanvasToPDFOptions, Position, Size } from '../types/canvas.types';

export const exportCanvasToPDF = async ({
  frontImage,
  backImage,
  cardWidth,
  cardHeight,
  fileName = 'business-card.pdf',
}: ExportCanvasToPDFOptions) => {
  const orientation = cardWidth >= cardHeight ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [cardWidth, cardHeight],
    compress: true,
  });

  const addSide = (image: string) => {
    pdf.addImage(image, 'PNG', 0, 0, cardWidth, cardHeight, undefined, 'FAST');
  };

  if (frontImage) addSide(frontImage);
  if (backImage) {
    pdf.addPage([cardWidth, cardHeight], orientation);
    addSide(backImage);
  }

  pdf.save(fileName);
};

// generate id
export const generateId = () => uuidv4();

export const transformToUrl = (file: File | string): string => {
  if (typeof file === 'string') return file;
  return URL.createObjectURL(file);
};

export const resolveStorageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  const apiEndpoint = String(import.meta.env.VITE_API_ENDPOINT || '');
  const apiOrigin = apiEndpoint.replace(/\/api\/?$/, '').replace(/\/$/, '');
  let storagePath = path;

  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    const isLocalStorageUrl =
      import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname.startsWith('/storage/');
    if (!isLocalStorageUrl && (!import.meta.env.DEV || url.origin !== apiOrigin)) return path;
    storagePath = url.pathname;
  }

  const cleanPath = storagePath.replace(/^\/?storage\/?/, '').replace(/^\/+/, '');

  return import.meta.env.DEV
    ? `/storage/${cleanPath}`
    : apiOrigin
      ? `${apiOrigin}/storage/${cleanPath}`
      : `/storage/${cleanPath}`;
};

/** Resolve an image that Konva must read into canvas (and later export). */
export const resolveCanvasAssetUrl = (path?: string | null): string => {
  const resolved = resolveStorageUrl(path);
  if (!resolved || !/^https?:\/\//i.test(resolved)) return resolved;

  const url = new URL(resolved);
  if (!/\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i.test(url.hostname)) return resolved;

  const apiEndpoint = String(import.meta.env.VITE_API_ENDPOINT || '').replace(/\/$/, '');
  const cleanPath = url.pathname.replace(/^\/+/, '');
  // The asset endpoint only serves these prefixes; catalog images load directly with CORS.
  if (!/^(templates|backgrounds)\//.test(cleanPath)) return resolved;
  return apiEndpoint ? `${apiEndpoint}/template-assets/${cleanPath}${url.search}` : resolved;
};

/**
 * Calculate snapped position based on grid or other objects
 */
export const snapToGrid = (position: number, gridSize: number): number => {
  return Math.round(position / gridSize) * gridSize;
};

/**
 * Find nearest snap line for alignment guides
 */
export const findSnapLines = (
  targetPos: Position,
  targetSize: { width: number; height: number },
  otherObjects: Array<{
    position: Position;
    size: { width: number; height: number };
  }>,
): {
  vertical: number[];
  horizontal: number[];
} => {
  const vertical: number[] = [];
  const horizontal: number[] = [];

  const targetCenterX = targetPos.x + targetSize.width / 2;
  const targetCenterY = targetPos.y + targetSize.height / 2;
  const targetRight = targetPos.x + targetSize.width;
  const targetBottom = targetPos.y + targetSize.height;

  otherObjects.forEach((obj) => {
    const objCenterX = obj.position.x + obj.size.width / 2;
    const objCenterY = obj.position.y + obj.size.height / 2;
    const objRight = obj.position.x + obj.size.width;
    const objBottom = obj.position.y + obj.size.height;

    // Vertical snap lines (x-axis)
    if (Math.abs(targetPos.x - obj.position.x) < SNAP_THRESHOLD) {
      vertical.push(obj.position.x);
    }
    if (Math.abs(targetCenterX - objCenterX) < SNAP_THRESHOLD) {
      vertical.push(objCenterX);
    }
    if (Math.abs(targetRight - objRight) < SNAP_THRESHOLD) {
      vertical.push(objRight);
    }

    // Horizontal snap lines (y-axis)
    if (Math.abs(targetPos.y - obj.position.y) < SNAP_THRESHOLD) {
      horizontal.push(obj.position.y);
    }
    if (Math.abs(targetCenterY - objCenterY) < SNAP_THRESHOLD) {
      horizontal.push(objCenterY);
    }
    if (Math.abs(targetBottom - objBottom) < SNAP_THRESHOLD) {
      horizontal.push(objBottom);
    }
  });

  return {
    vertical: [...new Set(vertical)],
    horizontal: [...new Set(horizontal)],
  };
};

/**
 * Apply snap to position
 */
export const applySnap = (position: Position, snapLines: { vertical: number[]; horizontal: number[] }): Position => {
  let x = position.x;
  let y = position.y;

  if (snapLines.vertical.length > 0) {
    const closest = snapLines.vertical.reduce((prev, curr) => {
      return Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev;
    });
    if (Math.abs(closest - x) < SNAP_THRESHOLD) {
      x = closest;
    }
  }

  if (snapLines.horizontal.length > 0) {
    const closest = snapLines.horizontal.reduce((prev, curr) => {
      return Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev;
    });
    if (Math.abs(closest - y) < SNAP_THRESHOLD) {
      y = closest;
    }
  }

  return { x, y };
};

type SnapCandidate = {
  position: number;
  guide: number;
  distance: number;
};

type CanvasSnapOptions = {
  canvasSize: Size;
  safeMargin: number;
  snapToCenter: boolean;
  snapToEdges: boolean;
  snapToObjects: boolean;
  snapToSafeArea: boolean;
};

const findClosestSnapCandidate = (currentPosition: number, candidates: Array<Omit<SnapCandidate, 'distance'>>) => {
  return candidates.reduce<SnapCandidate | null>((closest, candidate) => {
    const nextCandidate = {
      ...candidate,
      distance: Math.abs(candidate.position - currentPosition),
    };

    if (nextCandidate.distance >= SNAP_THRESHOLD) return closest;
    if (!closest || nextCandidate.distance < closest.distance) return nextCandidate;
    return closest;
  }, null);
};

/**
 * Snap an object to canvas landmarks, safe-area guides, or other objects.
 * The returned guide coordinates are in unscaled canvas coordinates.
 */
export const snapCanvasPosition = (
  position: Position,
  size: Size,
  otherObjects: Array<{ position: Position; size: Size }>,
  options: CanvasSnapOptions,
): {
  position: Position;
  lines: { vertical: number[]; horizontal: number[] };
} => {
  const xCandidates: Array<Omit<SnapCandidate, 'distance'>> = [];
  const yCandidates: Array<Omit<SnapCandidate, 'distance'>> = [];
  const { canvasSize, safeMargin } = options;

  if (options.snapToCenter) {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    xCandidates.push({ position: centerX - size.width / 2, guide: centerX });
    yCandidates.push({ position: centerY - size.height / 2, guide: centerY });
  }

  if (options.snapToEdges) {
    xCandidates.push({ position: 0, guide: 0 }, { position: canvasSize.width - size.width, guide: canvasSize.width });
    yCandidates.push({ position: 0, guide: 0 }, { position: canvasSize.height - size.height, guide: canvasSize.height });
  }

  if (options.snapToSafeArea) {
    const safeX = Math.min(canvasSize.width / 2, safeMargin);
    const safeY = Math.min(canvasSize.height / 2, safeMargin);
    const safeRight = canvasSize.width - safeX;
    const safeBottom = canvasSize.height - safeY;

    xCandidates.push({ position: safeX, guide: safeX }, { position: safeRight - size.width, guide: safeRight });
    yCandidates.push({ position: safeY, guide: safeY }, { position: safeBottom - size.height, guide: safeBottom });
  }

  if (options.snapToObjects) {
    const movingXOffsets = [0, size.width / 2, size.width];
    const movingYOffsets = [0, size.height / 2, size.height];

    otherObjects.forEach((object) => {
      const objectXGuides = [object.position.x, object.position.x + object.size.width / 2, object.position.x + object.size.width];
      const objectYGuides = [
        object.position.y,
        object.position.y + object.size.height / 2,
        object.position.y + object.size.height,
      ];

      objectXGuides.forEach((guide) => {
        movingXOffsets.forEach((offset) => xCandidates.push({ position: guide - offset, guide }));
      });
      objectYGuides.forEach((guide) => {
        movingYOffsets.forEach((offset) => yCandidates.push({ position: guide - offset, guide }));
      });
    });
  }

  const snappedX = findClosestSnapCandidate(position.x, xCandidates);
  const snappedY = findClosestSnapCandidate(position.y, yCandidates);

  return {
    position: {
      x: snappedX?.position ?? position.x,
      y: snappedY?.position ?? position.y,
    },
    lines: {
      vertical: snappedX ? [snappedX.guide] : [],
      horizontal: snappedY ? [snappedY.guide] : [],
    },
  };
};

/**
 * Debounce function using built-in setTimeout
 */
// ...existing code...
export const debounce = <Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number,
): ((...args: Args) => void) & { cancel: () => void } => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const executedFunction = ((...args: Args) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  }) as ((...args: Args) => void) & { cancel?: () => void };

  executedFunction.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return executedFunction as ((...args: Args) => void) & { cancel: () => void };
};
