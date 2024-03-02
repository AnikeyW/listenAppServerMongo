import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Delete()
  deleteAll() {
    return this.userService.deleteAll();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  @Patch('/updateimage')
  updateUserImage(@UploadedFiles() files, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { picture } = files;
    if (!picture[0]) {
      throw new HttpException(
        'Ошибка загрузки изображения',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.userService.updateImage(picture[0], accessToken);
  }
}
