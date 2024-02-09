import { Module } from '@nestjs/common';
import * as path from 'path';
import { TrackModule } from './track/track.module';
import { FileModule } from './file/file.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AlbumModule } from './album/album.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'static'),
    }),
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@cluster0.evypqpo.mongodb.net/music-platform?retryWrites=true&w=majority',
    ),
    TrackModule,
    FileModule,
    AlbumModule,
  ],
})
export class AppModule {}
