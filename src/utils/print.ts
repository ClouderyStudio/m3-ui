/**
 * 打印指定元素（只把这一块送进打印窗口，而不是整页）。
 *
 * 复制当前文档的样式表到新窗口，让打印出来的东西和屏幕上一致；
 * 新窗口用完即关。浏览器拦截弹窗时直接返回 false，由调用方提示用户。
 */
export function printElement(element: Element | null, options: { title?: string } = {}): boolean {
  if (!element || typeof window === 'undefined') return false
  const win = window.open('', '_blank', 'width=900,height=650')
  if (!win) return false

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n')

  const title = options.title ?? document.title
  win.document.open()
  win.document.write(
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
      title +
      '</title>' +
      styles +
      '<style>body{margin:24px;background:#fff;color:#000}</style>' +
      '</head><body>' +
      element.outerHTML +
      '</body></html>',
  )
  win.document.close()
  win.focus()
  // 等样式与字体落地再打印，否则第一页可能是无样式的裸文本
  setTimeout(() => {
    win.print()
    win.close()
  }, 300)
  return true
}
