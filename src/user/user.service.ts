import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { EntityType, FileService, FileType } from '../file/file.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly fileService: FileService,
    private readonly tokenService: TokenService,
  ) {}
  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email }, { __v: false });
  }

  async findById(id: string): Promise<UserDocument> {
    return await this.userModel.findOne({ _id: id }, { __v: false });
  }

  async create(user: CreateUserDto) {
    try {
      return await this.userModel.create(user);
    } catch (error) {
      throw new HttpException(
        'Ошибка при создании пользователя в базе данных',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAll() {
    return this.userModel.find();
  }

  async deleteAll() {
    await this.userModel.deleteMany();
    return 'Deleted all';
  }

  async updateImage(picture: any, accessToken: string) {
    const tokenData = await this.tokenService.validateAccessToken(accessToken);
    if (!tokenData) {
      throw new HttpException(
        'Ошибка валидации токена',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.findOne({ _id: tokenData.sub });
    if (!user) {
      throw new HttpException(
        'Пользователь с таким id не найден',
        HttpStatus.BAD_REQUEST,
      );
    }

    //удаляем старое изображение
    if (user.image) {
      try {
        this.fileService.removeFile(user.image);
      } catch (e) {
        console.log(e);
      }
    }

    const picturePath = this.fileService.createFile(
      FileType.IMAGE,
      picture,
      EntityType.USER,
    );

    user.image = picturePath;
    await user.save();

    return user;
  }
}
