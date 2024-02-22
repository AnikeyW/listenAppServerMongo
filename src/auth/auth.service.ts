import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async registration(dto: CreateUserDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = bcrypt.hashSync(dto.password, 10);
    const { password, ...userWithoutPass } = dto;

    return await this.userService.create({
      ...userWithoutPass,
      password: hashPassword,
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const candidate = await this.userService.findByEmail(email);
    if (!candidate) {
      throw new HttpException(
        'Неверный email или пароль',
        HttpStatus.BAD_REQUEST,
      );
    }

    const matchedPass = await bcrypt.compare(password, candidate.password);
    if (!matchedPass) {
      throw new HttpException(
        'Неверный email или пароль',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pauload = {
      _id: candidate._id,
      email: candidate.email,
      name: candidate.name,
    };

    const token = jwt.sign(pauload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { accessToken: token };
  }
}
