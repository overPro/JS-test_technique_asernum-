import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '@database/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstname, lastname } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      firstname,
      lastname,
      password_hash: passwordHash,
    });

    const { password_hash, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(userId: string) {
    return this.userRepository.findById(userId);
  }
}
