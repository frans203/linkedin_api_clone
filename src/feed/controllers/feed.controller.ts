import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Role } from 'src/auth/models/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IsCreatorGuard } from '../guards/is-creator.guard';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() post: FeedPost, @Request() req: any): Observable<FeedPost> {
    return this.feedService.createPost(req.user, post);
  }

  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts();
  // }

  @Get()
  findSelected(
    @Query('take') take: number = 1,
    @Query('skip') skip: number = 0,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Patch(':id')
  updatePost(
    @Body() feedPost: FeedPost,
    @Param('id') id: number,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  deletePost(@Param() id: number) {
    return this.feedService.deletePost(id);
  }
}
