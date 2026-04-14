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
  lapTimeFactor: number;         // Multiplier: 1.0 = standard. <1 = shorter laps, >1 = longer laps
  accentColor: string;           // Hex color for track-specific theming
  flagEmoji: string;             // Country flag emoji for display
}
