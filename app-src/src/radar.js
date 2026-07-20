// Shared hexagonal radar-chart geometry. Used by the self-assessment's single
// -participant ResultsView radar and the workshop's multi-participant overlay
// radar — one copy of the math so the two views can never drift apart.
export function radarGeometry(vals, n) {
  const cx = 220, cy = 200, R = 132, mx = 4
  const ang = (i) => ((-90 + i * 60) * Math.PI) / 180
  const pt = (r, i) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))]
  const rings = [1, 2, 3, 4].map((k) => ({
    points: Array.from({ length: n }, (_, i) => pt((k / mx) * R, i).map((v) => v.toFixed(1)).join(',')).join(' '),
  }))
  const axes = Array.from({ length: n }, (_, i) => {
    const [x, y] = pt(R, i)
    return { x1: cx, y1: cy, x2: x.toFixed(1), y2: y.toFixed(1) }
  })
  const points = vals.map((v, i) => pt((v / mx) * R, i).map((n2) => n2.toFixed(1)).join(',')).join(' ')
  const verts = vals.map((v, i) => {
    const [x, y] = pt((v / mx) * R, i)
    return { x: x.toFixed(1), y: y.toFixed(1) }
  })
  return { rings, axes, points, verts, pt, cx, cy, R }
}
