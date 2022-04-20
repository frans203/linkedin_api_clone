import { Module } from '@nestjs/common';
import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPostEntity } from './models/post.entity';
import { IsCreatorGuard } from './guards/is-creator.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPostEntity]), AuthModule],
  providers: [FeedService, IsCreatorGuard],
  controllers: [FeedController],
})
export class FeedModule {}
