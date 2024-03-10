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
    type: [
      {
        trackId: { type: Types.ObjectId, ref: 'Track' },
        addedAt: { type: Date, default: new Date() },
      },
    ],
  })
  favoritesTracks: { trackId: Types.ObjectId; addedAt: Date }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
