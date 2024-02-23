import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
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

  async login(user: any) {
    const payload = { username: user.name, sub: user._id };

    const tokens = this.tokenService.generateTokens(payload);
    await this.tokenService.saveToken(user._id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async logout(refreshToken: string) {
    const token = await this.tokenService.delete(refreshToken);
    return token;
  }

  // async refreshToken(user: any) {
  //   const payload = { username: user.name, sub: user._id };
  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //   };
  // }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const userData = this.tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.tokenService.findOne(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(userData.sub);
    const payload = { username: user.name, sub: user._id };
    const tokens = this.tokenService.generateTokens(payload);
    await this.tokenService.saveToken(user._id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        favoritesTracks: user.favoritesTracks,
      },
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
