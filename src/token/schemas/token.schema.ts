import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop()
  refreshToken: string;

  @Prop({ type: Types.ObjectId })
  userId: Types.ObjectId;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
