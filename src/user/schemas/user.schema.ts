import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: null })
  image: string;

  @Prop({
    trackId: { type: [{ type: Types.ObjectId, ref: 'Track' }] },
    addedAt: { type: Date, default: Date.now() },
  })
  favoritesTracks: { trackId: Types.ObjectId; addedAt: Date }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
