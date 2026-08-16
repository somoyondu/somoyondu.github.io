import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        // Paginated services return { items, meta } — unwrap into the envelope.
        if (payload && typeof payload === 'object' && 'items' in payload && 'meta' in payload) {
          return { success: true as const, data: payload.items, meta: payload.meta };
        }
        return { success: true as const, data: payload ?? null };
      }),
    );
  }
}
