import { DEFAULT_TEXT_COLOR } from './constants';

export function resolveImageUrlFromPrompt(label: string, currentUrl = '') {
  return window.prompt(label, currentUrl)?.trim();
}

export function normalizeColorInputValue(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_TEXT_COLOR;
}
