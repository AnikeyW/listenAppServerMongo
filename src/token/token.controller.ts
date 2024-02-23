import { Controller, Delete, Get, Param } from '@nestjs/common';
import { TokenService } from './token.service';
import { Types } from 'mongoose';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  getAll() {
    return this.tokenService.getAll();
  }

  @Delete(':id')
  delete(@Param('id') id: Types.ObjectId) {
    return this.tokenService.delete(id);
  }
}
