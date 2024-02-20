import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop()
  name: string;

  @Prop()
  artist: string;

  @Prop()
  text: string;

  @Prop()
  listens: number;

  @Prop()
  duration: number;

  @Prop()
  picture: string;

  @Prop()
  audio: string;

  @Prop()
  owner: string;

  @Prop({ type: Types.ObjectId })
  albumId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  comments: Types.ObjectId[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);
