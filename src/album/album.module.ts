import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileService } from '../file/file.service';
import { Album, AlbumSchema } from './schemas/album.schema';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { Track, TrackSchema } from '../track/schemas/track.schema';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }]),
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    TokenModule,
  ],
  controllers: [AlbumController],
  providers: [AlbumService, FileService],
})
export class AlbumModule {}
