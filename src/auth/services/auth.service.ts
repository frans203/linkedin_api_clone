import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { from, map, Observable, switchMap } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../models/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}
  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }

  registerAccount(user: User): Observable<User> {
    const { firstName, lastName, email, password } = user;

    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) => {
        return from(
          this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
          }),
        ).pipe(
          map((user: User) => {
            delete user.password;
            return user;
          }),
        );
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          password: true,
        },
        where: {
          email,
        },
      }),
    ).pipe(
      switchMap((user: User) => {
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
          }),
        );
      }),
    );
  }
  login(user: User) {
    const { email, password } = user;
    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          //create JWT credentials
          return from(this.jwtService.signAsync({ user }));
        }
      }),
    );
  }

  deleteUsers(id) {
    return this.userRepository.delete({ id });
  }
  async updateUser(email: string, newRole: Role) {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
      },
      where: {
        email,
      },
    });
    return await this.userRepository.update(user.id, {
      ...user,
      role: newRole,
    });
  }

  
}
