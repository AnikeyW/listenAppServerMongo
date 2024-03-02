import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('/albums')
export class AlbumController {
  constructor(private albumService: AlbumService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  create(@UploadedFiles() files, @Body() dto: CreateAlbumDto, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { picture } = files;
    return this.albumService.create(dto, picture[0], accessToken);
  }

  @Get()
  getAll() {
    return this.albumService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/useralbums')
  getMyAlbums(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.albumService.getMyAlbums(accessToken);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.albumService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: Types.ObjectId, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.albumService.delete(id, accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/addtrack')
  addTrack(
    @Body() data: { albumId: Types.ObjectId; trackId: Types.ObjectId },
    @Req() req,
  ) {
    const { albumId, trackId } = data;
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.albumService.addTrackToAlbum(albumId, trackId, accessToken);
  }
}
