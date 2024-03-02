import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('/tracks')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  create(@UploadedFiles() files, @Body() dto: CreateTrackDto, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { picture, audio } = files;
    if (!picture && typeof dto.picture === 'string') {
      return this.trackService.createWithAlbumPicture(
        accessToken,
        dto,
        audio[0],
      );
    } else {
      return this.trackService.create(accessToken, dto, picture[0], audio[0]);
    }
  }

  @Get()
  getAll(@Query('count') count: number, @Query('offset') offset: number) {
    return this.trackService.getAll(Number(count), Number(offset));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/usertracks')
  getMyTracks(
    @Query('count') count: number,
    @Query('offset') offset: number,
    @Req() req,
  ) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.trackService.getMyTracks(
      accessToken,
      Number(count),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/favorites')
  getFavorites(
    @Query('count') count: number,
    @Query('offset') offset: number,
    @Req() req,
  ) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.trackService.getFavorites(
      accessToken,
      Number(count),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tofavorites')
  addToFavorites(
    @Req() req,
    @Body()
    { trackId }: { trackId: Types.ObjectId },
  ) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.trackService.addToFavorites(trackId, accessToken);
  }

  @Get('/search')
  search(@Query('query') query: string) {
    return this.trackService.search(query);
  }

  @Get(':id')
  getOne(@Param('id') id: Types.ObjectId) {
    return this.trackService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req, @Param('id') id: Types.ObjectId) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.trackService.delete(id, accessToken);
  }

  @Post('/comment')
  addComment(@Body() dto: CreateCommentDto) {
    return this.trackService.addComment(dto);
  }

  @Post('/listen/:id')
  listen(@Param('id') id: Types.ObjectId) {
    return this.trackService.listen(id);
  }
}
