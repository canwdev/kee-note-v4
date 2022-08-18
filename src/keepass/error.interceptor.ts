import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import {catchError, Observable, throwError} from 'rxjs'

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // console.log('itc', err)
        return throwError(() => new HttpException(err.message, HttpStatus.BAD_REQUEST))
      })
    )
  }
}
