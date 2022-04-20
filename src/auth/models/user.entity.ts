import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from './role.enum';
import { FeedPostEntity } from 'src/feed/models/post.entity';
import { FriendRequestEntity } from './friend-request.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => FeedPostEntity, (feedPost) => feedPost.author)
  feedPosts: FeedPostEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequest) => friendRequest.creator,
  )
  sentFriendRequests: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (friendRequest) => friendRequest.receiver,
  )
  receivedFriendRequests: FriendRequestEntity[];
}
