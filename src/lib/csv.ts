/** Xuất CSV thật (UTF-8 có BOM để Excel mở đúng tiếng Việt). */
const thoat = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function taoCSV(cot: string[], dong: (string | number | null | undefined)[][]): string {
  return '﻿' + [cot, ...dong].map((r) => r.map(thoat).join(',')).join('\r\n')
}

export function taiVe(ten: string, noiDung: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([noiDung], { type: mime }))
  const a = document.createElement('a')
  a.href = url; a.download = ten
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
