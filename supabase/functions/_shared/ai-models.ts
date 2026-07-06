// Single source of truth for Lovable AI Gateway model ids used by edge functions.
// Change here to swap models across all functions at once.

// Stable, non-preview equivalent of google/gemini-3-flash-preview (same fast/cheap tier).
export const AI_MODEL_FAST = "google/gemini-2.5-flash";

// Alias kept for callsites that specifically mean the flash tier.
export const AI_MODEL_FLASH = AI_MODEL_FAST;
