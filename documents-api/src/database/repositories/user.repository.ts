import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email, deleted_at: IsNull() },
    });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
