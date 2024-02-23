import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
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

  // async login(
  //   email: string,
  //   password: string,
  // ): Promise<{ accessToken: string }> {
  //   const candidate = await this.userService.findByEmail(email);
  //   if (!candidate) {
  //     throw new HttpException(
  //       'Неверный email или пароль',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //
  //   const matchedPass = await bcrypt.compare(password, candidate.password);
  //   if (!matchedPass) {
  //     throw new HttpException(
  //       'Неверный email или пароль',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //
  //   const pauload = {
  //     _id: candidate._id,
  //     email: candidate.email,
  //     name: candidate.name,
  //   };
  //
  //   const token = jwt.sign(pauload, process.env.JWT_SECRET, {
  //     expiresIn: '1d',
  //   });
  //
  //   return { accessToken: token };
  // }

  async login(user: any) {
    const payload = { username: user.name, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && bcrypt.compareSync(pass, user.password)) {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        favoritesTracks: user.favoritesTracks,
      };
    }
    return null;
  }
}
