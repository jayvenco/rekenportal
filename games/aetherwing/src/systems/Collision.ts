/** Squared distance from a circle centre to the nearest point of an AABB. */
export const circleRectDistanceSq = (
  cx: number,
  cy: number,
  x: number,
  y: number,
  w: number,
  h: number,
): number => {
  const nx = cx < x ? x : cx > x + w ? x + w : cx;
  const ny = cy < y ? y : cy > y + h ? y + h : cy;
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy;
};

export const circleRect = (
  cx: number,
  cy: number,
  r: number,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean => circleRectDistanceSq(cx, cy, x, y, w, h) < r * r;
