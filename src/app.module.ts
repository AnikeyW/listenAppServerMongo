import { Module } from '@nestjs/common';
import * as path from 'path';
import { TrackModule } from './track/track.module';
import { FileModule } from './file/file.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AlbumModule } from './album/album.module';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'static'),
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30s' },
      global: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_CONNECT),
    TrackModule,
    FileModule,
    AlbumModule,
    AuthModule,
    UserModule,
    TokenModule,
  ],
})
export class AppModule {}
