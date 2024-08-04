import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from '../../auth/controllers/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/auth/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) { }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.encryptPassword(createUserDto.password);
    const user: User = await this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  async encryptPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async assignRole(email: string, role: Role): Promise<User> {
    const user = await this.findOneByEmail(email);

    if (!user.roles.includes(role)) {
      user.roles = [...user.roles, role];
    }

    return this.repository.save(user);
  }
}
