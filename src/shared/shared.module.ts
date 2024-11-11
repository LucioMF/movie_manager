import { Module, Global } from '@nestjs/common';
import { HttpErrorFilter } from './filters/http-error.filter';
import { ValidationPipe } from './pipes/validation.pipe';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AuthService } from './auth/auth.service';
import { JwtStrategyService } from './auth/strategies/jwt-strategy/jwt-strategy.service';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  providers: [
    AuthService,
    HttpErrorFilter,
    ValidationPipe,
    LoggingInterceptor,
    AuthService,
    JwtStrategyService,
  ],
  exports: [
    HttpErrorFilter,
    ValidationPipe,
    LoggingInterceptor,
    AuthService,
    JwtStrategyService,
  ],
  imports: [UserModule],
})
export class SharedModule { }
