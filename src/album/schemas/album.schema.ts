import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Track, TrackDocument } from '../../track/schemas/track.schema';

export type AlbumDocument = Album & Document;

@Schema()
export class Album {
  @Prop()
  name: string;

  @Prop()
  picture: string;

  @Prop()
  author: string;

  @Prop()
  owner: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Track' }] })
  tracks: TrackDocument[];
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
