import { USER_ROLES } from '@/constants/strings'
import { ProductLayout } from './ProductLayout'
export function UserLayout({ preview = false }: { preview?: boolean }) { return <ProductLayout role={USER_ROLES.user} preview={preview} /> }
