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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Track' }] })
  favoritesTracks: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
