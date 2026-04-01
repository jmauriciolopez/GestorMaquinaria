import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.authService.login(dto, tenantId ?? 'default');
  }
}
