import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Repository, UpdateResult } from 'typeorm';
import { FriendRequestEntity } from '../models/friend-request.entity';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friendRequest.interface';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private friendRequestRepository: Repository<FriendRequestEntity>,
  ) {}
  findUserById(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          feedPosts: true,
          imagePath: true,
        },
        where: { id },
        relations: ['feedPosts'],
      }),
    );
  }
  findUserByEmail(email) {
    return this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        feedPosts: true,
        imagePath: true,
      },
      where: { email },
      relations: ['feedPosts'],
    });
  }

  updateUserImgById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();
    user.id = id;
    user.imagePath = imagePath;

    return from(this.userRepository.update(id, user));
  }

  findImageNameByUserId(id: number): Observable<string> {
    return from(this.findUserById(id)).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      }),
    );
  }

  hasBeenSentOrReceived(creator: User, receiver: User) {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { receiver, creator },
          { creator: receiver, receiver: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: any): any => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }

  sendFriendRequest(receiverId: number, creator: User) {
    if (receiverId === creator.id) {
      throw new BadRequestException("You Can't send a request to yourself");
    }

    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return this.hasBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasBeenSentOrReceive): any => {
            if (hasBeenSentOrReceive)
              throw new BadRequestException(
                'This Friend request has already been sent',
              );

            let friendRequest = {
              creator,
              receiver,
              status: 'pending',
            };

            return this.friendRequestRepository.save(friendRequest);
          }),
        );
      }),
    );
  }

  getFriendRequestStatus(receiverId: number, currentUser: User) {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver): any => {
        return from(
          this.friendRequestRepository.findOne({
            where: { receiver, creator: currentUser },
          }),
        );
      }),

      switchMap((friendRequest: FriendRequest): any => {
        return of({ status: friendRequest.status });
      }),
    );
  }

  getFriendRequestUserById(friendRequestId: number) {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    );
  }

  respondFriendRequest(
    statusResponse: FriendRequest_Status,
    receiverId: number,
  ) {
    return this.getFriendRequestUserById(receiverId).pipe(
      switchMap((friendRequest): any => {
        return from(
          this.friendRequestRepository.update(friendRequest.id, {
            status: statusResponse,
          }),
        );
      }),
    );
  }

  getFriendRequestsRecipients(currentUser: User) {
    return from(
      this.friendRequestRepository.find({
        relations: ['creator', 'receiver'],
        where: [
          {
            receiver: currentUser,
          },
        ],
      }),
    );
  }
}
