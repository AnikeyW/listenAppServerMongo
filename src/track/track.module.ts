import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { FileService } from '../file/file.service';
import { AlbumService } from '../album/album.service';
import { Album, AlbumSchema } from '../album/schemas/album.schema';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Track.name, schema: TrackSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }]),
    UserModule,
    TokenModule,
  ],
  controllers: [TrackController],
  providers: [TrackService, FileService, AlbumService],
})
export class TrackModule {}
