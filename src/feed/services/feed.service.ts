import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/models/user.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { FeedPostEntity } from '../models/post.entity';
import { FeedPost } from '../models/post.interface';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
  ) {}

  createPost(user: User, feedPost: FeedPost): Observable<FeedPost> {
    feedPost.author = user;
    const post = this.feedPostRepository.create(feedPost);
    return from(this.feedPostRepository.save(post));
  }

  findAllPosts(): Observable<FeedPost[]> {
    return from(this.feedPostRepository.find());
  }

  findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
    return from(
      this.feedPostRepository
        .findAndCount({ take, skip })
        .then(([posts, count]) => {
          return <FeedPost[]>posts;
        }),
    );
  }
  findOnePost(id: number): Observable<FeedPost> {
    return from(
      this.feedPostRepository.findOne({
        select: {
          id: true,
          body: true,
          createdAt: true,
        },
        where: {
          id,
        },
        relations: ['author'],
      }),
    );
  }

  updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
    return from(this.feedPostRepository.update(id, feedPost));
  }

  deletePost(id: number): Observable<DeleteResult> {
    return from(this.feedPostRepository.delete(id));
  }
}
