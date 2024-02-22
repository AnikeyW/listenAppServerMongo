import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email });
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
}
