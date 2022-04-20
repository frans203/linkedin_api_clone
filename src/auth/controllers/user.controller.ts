import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Get,
  Param,
  Res,
  BadRequestException,
  Req,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../guards/jwt.guard';
import { UserService } from '../services/user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, Observable, of, switchMap } from 'rxjs';
import fs from 'fs';
import { FriendRequestStatus } from '../models/friendRequest.interface';
type validFileExtension = 'jpg' | 'jpeg' | 'png';
type validMimeType = 'image/png' | 'image/jpeg' | 'image/png';

const validFileExtension: validFileExtension[] = ['jpeg', 'png', 'jpg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpeg',
  'image/png',
];

const deleteFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.log(e);
  }
};

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      dest: './images',
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = extname(file.originalname);
          const randomName = uuidv4();
          cb(null, `${name}${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === ('image/png' || 'image/jpg' || 'image/jpeg')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const fileName = file?.filename;
    if (!fileName)
      throw new BadRequestException(
        'Please use a file of type: jpg, png, jpeg',
      );

    if (file.mimetype === ('image/png' || 'image/jpg' || 'image/jpeg')) {
      return this.userService.updateUserImgById(req.user.id, fileName);
    } else {
      throw new BadRequestException(
        'Please use a file of mimetype: jpg, png, jpeg',
      );
    }
  }

  @UseGuards(JwtGuard)
  @Get('image')
  getUserImage(@Request() req: any, @Res() res: any): Observable<any> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  async sendConnectionRequest(
    @Req() req: any,
    @Param('receiverId') receiverId: string,
  ) {
    const receiverIdNumber = parseInt(receiverId);
    const existingUser = await this.userService.findUserById(receiverIdNumber);
    return this.userService.sendFriendRequest(receiverIdNumber, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequest(@Req() req: any, @Param('receiverId') receiverId: string) {
    const receiverNumberId = parseInt(receiverId);
    return this.userService.getFriendRequestStatus(receiverNumberId, req.user);
  }

  @UseGuards(JwtGuard)
  @Patch('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Req() req: any,
    @Param('friendRequestId') friendRequestId: string,
    @Body() statusResponse: FriendRequestStatus,
  ) {
    const friendRequestNumberId = parseInt(friendRequestId);
    return this.userService.respondFriendRequest(
      statusResponse.status,
      friendRequestNumberId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestsFromRecipients(@Req() req: any) {
    return this.userService.getFriendRequestsRecipients(req.user);
  }
}
