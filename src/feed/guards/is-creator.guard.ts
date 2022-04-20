import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { use } from 'passport';
import { map, Observable, switchMap } from 'rxjs';
import { User } from 'src/auth/models/user.interface';
import { AuthService } from 'src/auth/services/auth.service';
import { UserService } from 'src/auth/services/user.service';
import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private feedService: FeedService,
    private authService: AuthService,
    private userService: UserService,
  ) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;
    if (!user || !params) return false;
    // if (user.role === 'admin') return true;
    const userId = user.id;
    const postId = params.id;

    return this.userService.findUserById(userId).pipe(
      switchMap((user: User) =>
        this.feedService.findOnePost(postId).pipe(
          map((feedPost: FeedPost) => {
            let isAuthor = user.id === feedPost.author.id;
            return isAuthor;
          }),
        ),
      ),
    );
  }
}
