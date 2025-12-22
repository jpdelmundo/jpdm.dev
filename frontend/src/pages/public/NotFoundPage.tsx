import { Error as ErrorComponent } from "@/components/Error"
import { ErrorCode } from "@shared/types/ErrorCode"

export const NotFoundPage = () => {
    return <ErrorComponent error={{ code: ErrorCode.NOT_FOUND, message: 'Not Found' }} />
}