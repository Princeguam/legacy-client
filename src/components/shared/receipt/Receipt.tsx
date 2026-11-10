import './receipt.css'
import { useEffect, useRef } from 'react'
import { FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/shared/Button'

export function Receipt({ file, onRemove }: { file: File; onRemove?: () => void }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const link = linkRef.current, image = imageRef.current
    if (link) link.href = url
    if (image) image.src = url
    return () => {
      link?.removeAttribute('href')
      image?.removeAttribute('src')
      URL.revokeObjectURL(url)
    }
  }, [file])
  return <div className="receipt-preview">
    {file.type.startsWith('image/') && <img ref={imageRef} alt={`Selected receipt: ${file.name}`} className="receipt-thumbnail" />}
    <div className="receipt-file"><FileText aria-hidden="true" /><div><p className="type-label receipt-name">{file.name}</p><p className="type-caption">{new Intl.NumberFormat('en-NG').format(file.size)} bytes · attached locally</p></div></div>
    <div className="inline-actions"><a ref={linkRef} target="_blank" rel="noopener noreferrer" className="standalone-link type-label">Open receipt<span className="sr-only"> in a new tab</span><ExternalLink size={16} aria-hidden="true" /></a>{onRemove && <Button variant="ghost" onClick={onRemove}>Remove receipt</Button>}</div>
  </div>
}
