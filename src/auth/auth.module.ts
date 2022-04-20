import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { FriendRequestEntity } from './models/friend-request.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  providers: [AuthService, JwtGuard, JwtStrategy, RolesGuard, UserService],
  controllers: [AuthController, UserController],
  exports: [AuthService, UserService],
})
export class AuthModule {}
