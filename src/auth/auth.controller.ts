import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  @Post('login')
  login(@Body() { email, password }: { email: string; password: string }) {
    return this.authService.login(email, password);
  }
}
