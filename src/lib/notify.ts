import { toast } from 'sonner'
import { API_MESSAGES } from '@/constants/strings'

/** Keep backend Error.message intact; use a fallback only when no message exists. */
export const notify = {
    success(message: string) { return toast.success(message) },
    error(error: unknown, fallback: string = API_MESSAGES.connection) {
        const message = error instanceof Error ? error.message : typeof error === 'string' ? error : fallback
        return toast.error(message, { id: `error:${message}` })
    },
}
