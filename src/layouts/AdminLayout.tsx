import { USER_ROLES } from '@/constants/strings'
import { ProductLayout } from './ProductLayout'
export function AdminLayout({ preview = false }: { preview?: boolean }) { return <ProductLayout role={USER_ROLES.admin} preview={preview} /> }
