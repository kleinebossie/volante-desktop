export interface TrackPoint {
  x: number;
  y: number;
}

export interface Track {
  id: string;                    // e.g., "bahrain"
  name: string;                  // e.g., "Bahrain International Circuit"
  country: string;               // e.g., "Bahrain"
  city: string;                  // e.g., "Sakhir"
  svgPath: string;               // SVG <path> d attribute string
  svgViewBox: string;            // e.g., "0 0 800 600"
  lapTimeFactor: number;         // Multiplier: 1.0 = standard. <1 = shorter laps, >1 = longer laps
  accentColor: string;           // Hex color for track-specific theming
  flagEmoji: string;             // Country flag emoji for display
}
