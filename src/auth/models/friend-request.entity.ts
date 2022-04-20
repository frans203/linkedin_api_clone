import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.enum';
import { FeedPostEntity } from 'src/feed/models/post.entity';
import { UserEntity } from './user.entity';
import { User } from './user.interface';

@Entity('request')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequests)
  creator: User;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.receivedFriendRequests,
  )
  receiver: User;

  @Column()
  status: string;
}
