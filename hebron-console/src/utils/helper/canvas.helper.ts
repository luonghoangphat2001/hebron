import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { SNAP_THRESHOLD } from '../constants/canvas-editor.constant';
import type { ExportCanvasToPDFOptions, Position } from '../types/canvas.types';

export const exportCanvasToPDF = async ({
  frontImage,
  backImage,
  cardWidth,
  cardHeight,
  fileName = 'business-card.pdf',
}: ExportCanvasToPDFOptions) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const SPACING = 10; // 10mm spacing between cards

  // Calculate total height of both cards plus spacing
  const totalHeight = backImage ? cardHeight * 2 + SPACING : cardHeight;

  // Center vertically
  const startY = (A4_HEIGHT - totalHeight) / 2;
  const x = (A4_WIDTH - cardWidth) / 2;

  // Add front side
  if (frontImage) {
    pdf.addImage(frontImage, 'PNG', x, startY, cardWidth, cardHeight, undefined, 'FAST');
  }

  // Add back side on the same page below the front side
  if (backImage) {
    const backY = startY + cardHeight + SPACING;
    pdf.addImage(backImage, 'PNG', x, backY, cardWidth, cardHeight, undefined, 'FAST');
  }

  // Download PDF
  pdf.save(fileName);
};

// generate id
export const generateId = () => uuidv4();

export const transformToUrl = (file: File | string): string => {
  if (typeof file === 'string') return file;
  return URL.createObjectURL(file);
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
