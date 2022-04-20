import {
  Controller,
  Body,
  Post,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Post('register')
  async register(@Body() user: User) {
    const existingUser = await this.userService.findUserByEmail(user.email);
    if (existingUser) throw new BadRequestException('User Already Exists');
    return this.authService.registerAccount(user);
  }

  @Post('login')
  login(@Body() user: User) {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

  @Delete('delete/:id')
  deleteUser(@Param('id') id: number) {
    return this.authService.deleteUsers(id);
  }

  @Post('update')
  async updateUser(@Body() body: any) {
    console.log(body);
    return await this.authService.updateUser(body.email, body.role);
  }
}
