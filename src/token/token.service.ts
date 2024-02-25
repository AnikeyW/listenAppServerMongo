import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './schemas/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  generateTokens(payload) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await this.tokenModel.findOne({ userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await this.tokenModel.create({ userId, refreshToken });
    return token;
  }

  async getAll() {
    return await this.tokenModel.find();
  }

  async delete(refreshToken) {
    return await this.tokenModel.deleteOne({ refreshToken });
  }

  async findOne(refreshToken) {
    return await this.tokenModel.findOne({ refreshToken });
  }

  validateAccessToken(token) {
    try {
      const userData = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      return userData;
    } catch (e) {
      return null;
    }
  }
}
