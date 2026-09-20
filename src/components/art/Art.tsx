/**
 * Hình minh hoạ vẽ bằng SVG — thay cho ảnh chụp cầu giấy trong bản thiết kế.
 * Toàn bộ nằm trong bundle: không tải ảnh ngoài, chạy được offline.
 */
import type { CSSProperties } from 'react'

const archY = (x: number) => {
  const t = (x - 6) / 52
  return 38 * ((1 - t) ** 2 + t ** 2) - 4 * t * (1 - t)
}

/** Biểu trưng SDT: cầu vòm giàn nét mảnh */
export function LogoMark({ size = 44, color = '#3fb0b3' }: { size?: number; color?: string }) {
  const xs = [14, 22, 32, 42, 50]
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 64 50" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 38 Q32 -2 58 38" />
      <path d="M3 38 H61" />
      <path d="M3 42 H61" strokeWidth="1.2" opacity=".7" />
      {xs.map((x) => <path key={x} d={`M${x} 38 V${archY(x).toFixed(1)}`} strokeWidth="1.3" />)}
      {xs.slice(0, -1).map((x, i) => (
        <path key={'d' + x} d={`M${x} 38 L${xs[i + 1]} ${archY(xs[i + 1]).toFixed(1)}`} strokeWidth="1.1" opacity=".8" />
      ))}
      <path d="M6 38 V46 M58 38 V46" strokeWidth="2.2" />
    </svg>
  )
}

/** Ảnh nền thẻ chào: cầu giàn thép giữa đồi và cây */
export function HeroBridge({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const px = [232, 262, 292, 322, 352, 382, 412]
  return (
    <svg viewBox="0 0 520 150" preserveAspectRatio="xMaxYMid slice" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f1f0" /><stop offset="1" stopColor="#eef9f6" />
        </linearGradient>
        <linearGradient id="hb-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe6e4" /><stop offset="1" stopColor="#9fd6d6" />
        </linearGradient>
      </defs>
      <rect width="520" height="150" fill="url(#hb-sky)" />
      <path d="M0 105 Q60 70 130 100 T260 96 T400 92 T520 100 V150 H0Z" fill="#c9e9e3" />
      <path d="M180 108 Q260 84 340 106 T520 104 V150 H180Z" fill="#b6ded9" opacity=".8" />
      <rect y="118" width="520" height="32" fill="url(#hb-water)" />
      {/* cầu */}
      <g stroke="#5f7d92" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M200 112 H452" strokeWidth="4" />
        <path d="M212 112 Q322 38 442 112" strokeWidth="3" />
        {px.map((x) => {
          const t = (x - 212) / 230
          const y = 112 - 4 * 74 * 0.5 * t * (1 - t) * 2
          return <path key={x} d={`M${x} 112 V${y.toFixed(1)}`} strokeWidth="1.8" />
        })}
        {px.slice(0, -1).map((x, i) => {
          const t2 = (px[i + 1] - 212) / 230
          const y2 = 112 - 4 * 74 * 0.5 * t2 * (1 - t2) * 2
          return <path key={'d' + x} d={`M${x} 112 L${px[i + 1]} ${y2.toFixed(1)}`} strokeWidth="1.4" opacity=".85" />
        })}
      </g>
      <rect x="206" y="112" width="10" height="26" fill="#6d8ba0" /><rect x="436" y="112" width="10" height="26" fill="#6d8ba0" />
      <path d="M0 132 Q130 126 260 132 T520 130" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" fill="none" />
      {/* cây */}
      {[[40, 108, 30], [78, 112, 22], [488, 106, 32], [462, 114, 20], [150, 116, 16]].map(([x, y, r], i) => (
        <g key={i}>
          <rect x={x - 2} y={y} width="4" height="16" fill="#6b8e7c" />
          <circle cx={x} cy={y - 4} r={r} fill={i % 2 ? '#7cc4a4' : '#5db08f'} />
          <circle cx={x - r * 0.4} cy={y + 2} r={r * 0.6} fill="#8ad0b0" opacity=".9" />
        </g>
      ))}
    </svg>
  )
}

type Kieu = 'truss' | 'arch' | 'box' | 'plank'
const tones = {
  light: { bg1: '#f3f1ec', bg2: '#e5e2da', fg: '#ffffff', st: '#a7b1ba', sh: '#0000001f' },
  dark: { bg1: '#5a5148', bg2: '#3f382f', fg: '#eef0f1', st: '#b8c0c7', sh: '#00000040' },
  wood: { bg1: '#d8b98a', bg2: '#b99666', fg: '#f6f2ea', st: '#8f8677', sh: '#00000030' },
} as const

/** "Ảnh chụp" sản phẩm cầu giấy: nền + cầu vẽ tay bằng SVG */
export function AnhCau({ kieu = 'truss', tone = 'light', className = '', label }: {
  kieu?: Kieu; tone?: keyof typeof tones; className?: string; label?: string
}) {
  const c = tones[tone]
  const id = `ac-${kieu}-${tone}`
  const xs = [58, 84, 110, 136, 162, 188, 214, 240]
  return (
    <svg viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.bg1} /><stop offset="1" stopColor={c.bg2} /></linearGradient>
      </defs>
      <rect width="300" height="170" fill={`url(#${id})`} />
      <ellipse cx="150" cy="132" rx="120" ry="9" fill={c.sh} />
      {kieu === 'box' && (
        <g>
          <path d="M40 100 L60 78 H262 L242 100Z" fill={c.fg} stroke={c.st} />
          <rect x="40" y="100" width="202" height="22" fill="#fff" stroke={c.st} />
          <path d="M242 100 L262 78 V100 L242 122Z" fill="#e8ecef" stroke={c.st} />
        </g>
      )}
      {kieu === 'plank' && (
        <g>
          <path d="M40 112 L70 92 H266 L236 112Z" fill={c.fg} stroke={c.st} />
          <path d="M40 112 H236 V118 H40Z" fill="#dfe4e8" stroke={c.st} />
        </g>
      )}
      {kieu === 'truss' && (
        <g stroke={c.st} strokeWidth="1.6" fill="none" strokeLinejoin="round">
          <path d="M44 118 H256" strokeWidth="5" stroke={c.fg} />
          <path d="M44 118 H256" strokeWidth="1.4" />
          <path d="M58 76 H242" strokeWidth="5" stroke={c.fg} />
          <path d="M58 76 H242" strokeWidth="1.4" />
          {xs.map((x, i) => (
            <g key={x}>
              <path d={`M${x} 118 V76`} stroke={c.fg} strokeWidth="4" />
              <path d={`M${x} 118 V76`} />
              {i < xs.length - 1 && <path d={`M${x} ${i % 2 ? 76 : 118} L${xs[i + 1]} ${i % 2 ? 118 : 76}`} />}
            </g>
          ))}
          <path d="M44 118 L58 76 M256 118 L242 76" strokeWidth="2.4" />
        </g>
      )}
      {kieu === 'arch' && (
        <g stroke={c.st} strokeWidth="1.6" fill="none" strokeLinejoin="round">
          <path d="M40 120 H262" strokeWidth="6" stroke={c.fg} />
          <path d="M40 120 H262" strokeWidth="1.4" />
          <path d="M56 120 Q151 22 246 120" strokeWidth="6" stroke={c.fg} />
          <path d="M56 120 Q151 22 246 120" strokeWidth="1.4" />
          {[76, 100, 124, 151, 178, 202, 226].map((x) => {
            const t = (x - 56) / 190
            const y = 120 - 4 * 49 * t * (1 - t)
            return <path key={x} d={`M${x} 120 V${y.toFixed(1)}`} />
          })}
          {[76, 100, 124, 151, 178, 202].map((x, i, a) => {
            const nx = [100, 124, 151, 178, 202, 226][i]
            const t = (nx - 56) / 190
            const y = 120 - 4 * 49 * t * (1 - t)
            void a
            return <path key={'d' + x} d={`M${x} 120 L${nx} ${y.toFixed(1)}`} strokeWidth="1.2" />
          })}
        </g>
      )}
    </svg>
  )
}

export type KieuKetCau = 'phang' | 'chuU' | 'hop' | 'tamgiac' | 'gian'
/** Hình minh hoạ nhỏ cho từng cấu trúc giấy trong bảng khảo sát (HĐ2) */
export function KetCauGiay({ kieu, className = '' }: { kieu: KieuKetCau; className?: string }) {
  const s = '#7e8b97'
  return (
    <svg viewBox="0 0 64 34" className={className} fill="none" stroke={s} strokeWidth="1.3" strokeLinejoin="round" aria-hidden>
      {kieu === 'phang' && <><path d="M6 24 L18 10 H58 L46 24Z" fill="#fff" /><path d="M6 24 H46 V27 H6Z" fill="#e3e8ec" /></>}
      {kieu === 'chuU' && <><path d="M10 12 V26 H54 V12" fill="#fff" /><path d="M10 12 L20 6 H62 L54 12Z" fill="#f3f5f7" /><path d="M54 12 L62 6 V20 L54 26Z" fill="#e3e8ec" /></>}
      {kieu === 'hop' && <><path d="M8 12 L18 5 H60 L50 12Z" fill="#f3f5f7" /><rect x="8" y="12" width="42" height="15" fill="#fff" /><path d="M50 12 L60 5 V20 L50 27Z" fill="#e3e8ec" /></>}
      {kieu === 'tamgiac' && <><path d="M8 27 L26 7 H56 L38 27Z" fill="#f3f5f7" /><path d="M8 27 H38 L26 7Z" fill="#fff" /><path d="M38 27 L56 7 V13 L44 27Z" fill="#e3e8ec" /></>}
      {kieu === 'gian' && <><path d="M6 26 H58 M6 10 H58" strokeWidth="1.6" />{[10, 18, 26, 34, 42, 50, 58].map((x, i, a) => i < a.length - 1 && <path key={x} d={`M${x} ${i % 2 ? 10 : 26} L${a[i + 1]} ${i % 2 ? 26 : 10}`} />)}{[6, 14, 22, 30, 38, 46, 54].map((x) => <path key={'v' + x} d={`M${x} 10 V26`} opacity=".45" />)}</>}
    </svg>
  )
}

/** Nét trang trí lá cây — dùng cho khối trích dẫn */
export function LaCay({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden>
      <path d="M30 56 V26" stroke="#6bb8a0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 32 C14 32 8 20 10 8 C24 8 32 16 30 32Z" fill="#8ccfb6" />
      <path d="M30 40 C44 40 52 30 50 16 C36 16 28 26 30 40Z" fill="#5db08f" />
    </svg>
  )
}
