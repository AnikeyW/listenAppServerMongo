import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    const userData = await this.authService.login(req.user);
    return userData;
  }

  @Post('logout')
  async logout(@Body() data) {
    const { refreshToken } = data;
    if (!refreshToken) {
      throw new HttpException(
        'Отсутствует refreshToken',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.authService.logout(refreshToken);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  async refresh(@Body() data) {
    const { refreshToken } = data;
    if (!refreshToken) {
      throw new HttpException(
        'Отсутствует refreshToken',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const userData = await this.authService.refresh(refreshToken);
    return userData;
  }
}
