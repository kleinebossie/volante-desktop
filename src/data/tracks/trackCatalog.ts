import type { Track } from '../../types/track';
import { TRACK_PATHS } from './trackPaths';

// Helper to build a track entry, pulling its path from the extracted data
function track(
  id: string,
  layoutId: string,
  name: string,
  countryId: string,
  countryName: string,
  flagEmoji: string,
  lapTimeFactor: number,
  accentColor: string
): Track {
  const svgPathD = TRACK_PATHS[layoutId];
  if (!svgPathD) {
    console.warn(`Missing SVG path for layout: ${layoutId}`);
  }
  return { id, layoutId, name, countryId, countryName, svgPathD: svgPathD ?? '', lapTimeFactor, accentColor, flagEmoji };
}

export const TRACK_CATALOG: Track[] = [
  // Ordered by 2026 F1 calendar (Round 1 → Round 24)
  track('melbourne',         'melbourne-2',         'Melbourne Grand Prix Circuit',        'australia',              'Australia',          '🇦🇺', 0.9, '#003580'),
  track('shanghai',          'shanghai-1',           'Shanghai International Circuit',      'china',                  'China',              '🇨🇳', 1.1, '#de2910'),
  track('suzuka',            'suzuka-2',             'Suzuka Circuit',                      'japan',                  'Japan',              '🇯🇵', 1.1, '#bc002d'),
  track('bahrain',           'bahrain-1',            'Bahrain International Circuit',       'bahrain',                'Bahrain',            '🇧🇭', 1.0, '#d4a844'),
  track('jeddah',            'jeddah-1',             'Jeddah Corniche Circuit',             'saudi-arabia',           'Saudi Arabia',       '🇸🇦', 1.2, '#1a7a3a'),
  track('miami',             'miami-1',              'Miami International Autodrome',       'united-states-of-america','USA (Miami)',        '🇺🇸', 1.0, '#f4a261'),
  track('montreal',          'montreal-6',           'Circuit Gilles Villeneuve',           'canada',                 'Canada',             '🇨🇦', 0.9, '#ff0000'),
  track('monaco',            'monaco-6',             'Circuit de Monaco',                   'monaco',                 'Monaco',             '🇲🇨', 0.6, '#c8102e'),
  track('catalunya',         'catalunya-6',          'Circuit de Barcelona-Catalunya',      'spain',                  'Spain',              '🇪🇸', 1.0, '#f1bf00'),
  track('spielberg',         'spielberg-3',          'Red Bull Ring',                       'austria',                'Austria',            '🇦🇹', 0.7, '#ed1c24'),
  track('silverstone',       'silverstone-8',        'Silverstone Circuit',                 'united-kingdom',         'Great Britain',      '🇬🇧', 1.0, '#012169'),
  track('spa-francorchamps', 'spa-francorchamps-4',  'Circuit de Spa-Francorchamps',        'belgium',                'Belgium',            '🇧🇪', 1.3, '#fdda24'),
  track('hungaroring',       'hungaroring-3',        'Hungaroring',                         'hungary',                'Hungary',            '🇭🇺', 0.9, '#477050'),
  track('zandvoort',         'zandvoort-5',          'Circuit Park Zandvoort',              'netherlands',            'Netherlands',        '🇳🇱', 0.7, '#ff6600'),
  track('monza',             'monza-7',              'Autodromo Nazionale Monza',           'italy',                  'Italy',              '🇮🇹', 1.0, '#009246'),
  track('madring',           'madring-1',            'Circuito de Madring',                 'spain',                  'Spain (Madrid)',     '🇪🇸', 1.0, '#f1bf00'),
  track('baku',              'baku-1',               'Baku City Circuit',                   'azerbaijan',             'Azerbaijan',         '🇦🇿', 1.2, '#0092bc'),
  track('marina-bay',        'marina-bay-4',         'Marina Bay Street Circuit',           'singapore',              'Singapore',          '🇸🇬', 1.0, '#ef3340'),
  track('austin',            'austin-1',             'Circuit of the Americas',             'united-states-of-america','USA (Austin)',       '🇺🇸', 1.1, '#3c3b6e'),
  track('mexico-city',       'mexico-city-3',        'Autódromo Hermanos Rodríguez',        'mexico',                 'Mexico',             '🇲🇽', 0.9, '#006847'),
  track('interlagos',        'interlagos-2',         'Autódromo José Carlos Pace',          'brazil',                 'Brazil',             '🇧🇷', 0.9, '#009739'),
  track('las-vegas',         'las-vegas-1',          'Las Vegas Street Circuit',            'united-states-of-america','USA (Las Vegas)',    '🇺🇸', 1.2, '#b4975a'),
  track('lusail',            'lusail-1',             'Lusail International Circuit',        'qatar',                  'Qatar',              '🇶🇦', 1.0, '#8a1538'),
  track('yas-marina',        'yas-marina-2',         'Yas Marina Circuit',                  'united-arab-emirates',   'Abu Dhabi',          '🇦🇪', 1.0, '#c8102e'),
];
