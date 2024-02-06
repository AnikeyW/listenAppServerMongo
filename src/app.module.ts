import { Module } from '@nestjs/common';
import * as path from "path";
import {TrackModule} from "./track/track.module";
import {FileModule} from "./file/file.module";
import {MongooseModule} from "@nestjs/mongoose";
import {ServeStaticModule} from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({rootPath: path.resolve(__dirname, 'static')}),
    MongooseModule.forRoot('mongodb+srv://admin:admin@cluster0.evypqpo.mongodb.net/music-platform?retryWrites=true&w=majority'),
    // MongooseModule.forRoot('mongodb+srv://admin:admin@cluster0.oeudk.mongodb.net/music-platform?retryWrites=true&w=majority'),
    TrackModule,
    FileModule
  ],
})
export class AppModule {}
// mongodb+srv://admin:<password>@cluster0.evypqpo.mongodb.net/?retryWrites=true&w=majority