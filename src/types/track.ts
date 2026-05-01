export interface TrackPoint {
  x: number;
  y: number;
}

export interface Track {
  id: string;                    // Circuit ID from f1-circuits-svg repo (e.g., "bahrain")
  layoutId: string;              // Specific layout version (e.g., "bahrain-1")
  name: string;                  // e.g., "Bahrain International Circuit"
  countryId: string;             // Country slug (e.g., "bahrain", "united-kingdom")
  countryName: string;           // Display name (e.g., "Bahrain", "United Kingdom")
  svgPathD: string;              // SVG <path> `d` attribute string (extracted from f1-circuits-svg)
  lapTimeSec: number;            // Approximate real F1 lap time in seconds (e.g. Monaco = 76)
  startOffset: number;           // 0.0–1.0: fraction along the path where start/finish line sits
  reversed: boolean;             // If true, the car drives in the opposite direction along the path
  accentColor: string;           // Hex color for track-specific theming
  flagEmoji: string;             // Country flag emoji for display
}
