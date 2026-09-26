import Svg, { Path } from 'react-native-svg';

import type { IconGlyph } from '@/components/Icon';

// Source: Claude Design · "Category Icons.dc.html". 24px grid, 2px stroke,
// round joins. `d` is stroked; `f` holds the small solid details (pupils, a
// seal, a keyhole). Both are drawn in the glyph colour — the category colour
// lives on the tile, never on the glyph.

/** A full circle as a path, so every glyph is just two path strings. */
const c = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const glyph = (d: string, f = ''): IconGlyph =>
  function CategoryGlyph({ size = 24, color = '#0A0A0A', strokeWidth = 2 }) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {!!f && <Path d={f} fill={color} />}
      </Svg>
    );
  };

export const Biography = glyph(
  'M5 5a2 2 0 0 1 2-2h11v18H7a2 2 0 0 1-2-2zM8.5 3v18' + c(13.25, 9.75, 2.25) + 'M9.5 17a3.75 3.75 0 0 1 7.5 0',
);
export const Memoir = glyph(
  'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8.5 3v18M11 7.5h4M15 10h6v5h-6',
  c(18, 12.5, 1),
);
export const Fiction = glyph(
  'M3 20c3-1 6-1 9 0c3-1 6-1 9 0v-6c-3-1-6-1-9 0c-3-1-6-1-9 0zM12 14v6M14 3.5a4.2 4.2 0 1 0 4 6a3.4 3.4 0 0 1-4-6zM7 4v3.5M5.25 5.75h3.5',
);
export const SelfImprovement = glyph(
  'M3 20.5h5.5V16H14v-4.5h7M3 20.5V16M8.5 16v-.01M14 11.5v-.01M4 11l6-6M6.5 5H10v3.5',
);
export const Philosophy = glyph(
  'M6 15V4.5l3.5 2a6.5 6.5 0 0 1 5 0l3.5-2V15a6 6 0 0 1-12 0z' +
    c(9.5, 11, 2) +
    c(14.5, 11, 2) +
    'M11 14.5l1 1.5l1-1.5',
  c(9.5, 11, 0.8) + c(14.5, 11, 0.8),
);
export const History = glyph('M4.5 4h15v3h-15zM7.5 7v11M16.5 7v11M10.5 7v11M13.5 7v11M5 18h14v3H5z');
export const Science = glyph(
  'M9 3h6M10.5 3v6L5.2 18.8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.3-2.2L13.5 9V3M7.6 15h8.8',
  c(11, 18, 0.9) + c(14.2, 12.3, 0.8),
);
export const Poetry = glyph(
  'M19.5 3.5C13.5 4 9 8.5 8 15M19.5 3.5C19 9 15.5 13 10 14.5M8 15l-2.5 4.5M10 20.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0',
);
export const Mystery = glyph(c(10.5, 10.5, 6.5) + 'M15.3 15.3l5.2 5.2', c(10.5, 9.3, 1.5) + 'M9.7 10l-.7 3.2h3L11.3 10z');
export const Fantasy = glyph(
  'M3 21V10h2.5v2H8v-2h2v2h4v-2h2v2h2.5v-2H21v11zM10 21v-3.5a2 2 0 0 1 4 0V21M12 10V3.5l4 1.5-4 1.5',
);
export const Romance = glyph(
  'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3.5 7l8.5 6.5L20.5 7',
  'M12 18.2c-2.3-1.4-3.4-2.6-3.4-3.8a1.6 1.6 0 0 1 3.4-.9a1.6 1.6 0 0 1 3.4.9c0 1.2-1.1 2.4-3.4 3.8z',
);
export const Business = glyph('M5 20.5v-4M10 20.5v-6M15 20.5v-4.5M20 20.5v-8M3.5 12l5-5 4 3 7-6.5M16 3.5h3.5V7');
export const Psychology = glyph(
  'M7 21v-5.2C5.4 14.5 4.5 12.5 4.5 10c0-4 3-7 7-7s7.5 3 7.5 7l1.5 3.2-1.5.5v2.8a1.5 1.5 0 0 1-1.5 1.5H15V21M12 10a1 1 0 0 1 1 1a2 2 0 0 1-2 2a3 3 0 0 1-3-3a4 4 0 0 1 4-4',
);
export const SciFi = glyph(
  'M12 2.5c3 2 4.5 5.5 4.5 9.5v4h-9v-4c0-4 1.5-7.5 4.5-9.5z' +
    c(12, 9, 1.8) +
    'M7.5 12.5L5 15v3.5l2.5-2M16.5 12.5L19 15v3.5l-2.5-2M10.5 19l1.5 2.5 1.5-2.5',
);
export const Horror = glyph(
  'M6 21V10a6 6 0 0 1 12 0v11l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z' + c(12, 15, 1),
  c(10, 11, 1.1) + c(14, 11, 1.1),
);
export const Comics = glyph(
  'M12 2.5l2 4 4.5-1.5-1 4.5 4 2-4 2.5 1 4.5-4.5-1-2 4-2-4-4.5 1 1-4.5-4-2.5 4-2-1-4.5 4.5 1.5zM12 9v3.5',
  c(12, 15, 1),
);
export const Travel = glyph(
  'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14M16.8 9.8l2.4 2.4M19.2 9.8l-2.4 2.4M5.5 13.5c1.2-.3 2-1 2.5-2',
);
export const Spirituality = glyph(
  'M12 5c2.5 2.5 2.5 8 0 11c-2.5-3-2.5-8.5 0-11zM12 16c-3 0-6.5-1.5-8-6c3.5 0 6.5 1.5 8 6M12 16c3 0 6.5-1.5 8-6c-3.5 0-6.5 1.5-8 6M5 19.5h14',
);
