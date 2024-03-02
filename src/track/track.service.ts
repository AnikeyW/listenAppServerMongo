import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateTrackDto } from './dto/create-track.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EntityType, FileService, FileType } from '../file/file.service';
import { AlbumService } from '../album/album.service';
import { Album, AlbumDocument } from '../album/schemas/album.schema';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    private fileService: FileService,
    private albumService: AlbumService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async create(dto: CreateTrackDto, picture, audio): Promise<Track> {
    const audioPath = this.fileService.createFile(
      FileType.AUDIO,
      audio,
      EntityType.TRACK,
    );
    const picturePath = this.fileService.createFile(
      FileType.IMAGE,
      picture,
      EntityType.TRACK,
    );
    const duration: number = await this.fileService.getAudioDuration(
      audio.buffer,
    );
    const { albumId, ...rest } = dto;
    const track = await this.trackModel.create({
      ...rest,
      albumId: albumId ? albumId : null,
      listens: 0,
      audio: audioPath,
      picture: picturePath,
      duration: duration,
    });
    if (albumId) {
      await this.albumService.addTrackToAlbum(albumId, track._id);
    }
    return track;
  }

  async createWithAlbumPicture(dto: CreateTrackDto, audio): Promise<Track> {
    const audioPath = this.fileService.createFile(
      FileType.AUDIO,
      audio,
      EntityType.TRACK,
    );
    const duration: number = await this.fileService.getAudioDuration(
      audio.buffer,
    );
    const { albumId, ...rest } = dto;
    const track = await this.trackModel.create({
      ...rest,
      albumId: albumId ? albumId : null,
      listens: 0,
      audio: audioPath,
      duration: duration,
    });
    if (albumId) {
      await this.albumService.addTrackToAlbum(albumId, track._id);
    }
    return track;
  }

  async getAll(count = 10, offset = 0): Promise<Track[]> {
    const tracks = await this.trackModel
      .find()
      .skip(Number(offset))
      .limit(Number(count))
      .sort({ listens: -1 });
    return tracks;
  }

  async getMyTracks(
    accessToken: string,
    count: number = 10,
    offset: number = 0,
  ): Promise<Track[]> {
    const tokenData = await this.tokenService.validateAccessToken(accessToken);

    if (!tokenData) {
      throw new HttpException(
        'Не валидный токен доступа',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tracks = await this.trackModel
      .find({ owner: tokenData.sub })
      .skip(Number(offset))
      .limit(Number(count))
      .sort({ createdAt: -1 });
    return tracks;
  }

  async getOne(id: Types.ObjectId): Promise<Track> {
    const track = await this.trackModel.findById(id).populate('comments');
    return track;
  }

  async getFavorites(
    accessToken: string,
    count: number = 10,
    offset: number = 0,
  ): Promise<Track[]> {
    const tokenData = await this.tokenService.validateAccessToken(accessToken);

    if (!tokenData) {
      throw new HttpException(
        'Не валидный токен доступа',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findById(tokenData.sub);
    if (!user) {
      throw new HttpException(
        'Неверный id пользователя',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tracks = await this.trackModel
      .find({ _id: user.favoritesTracks })
      .skip(Number(offset))
      .limit(Number(count))
      .sort({ createdAt: -1 });
    return tracks;
  }

  async delete(id: Types.ObjectId): Promise<Types.ObjectId> {
    const track = await this.trackModel.findByIdAndDelete(id);
    if (!track) {
      throw new HttpException(
        'Трек с таким id не найден',
        HttpStatus.BAD_REQUEST,
      );
    }

    const entityType = track.picture.split('/')[1];

    if (entityType === EntityType.TRACK) {
      this.fileService.removeFile(track.picture);
    }

    this.fileService.removeFile(track.audio);

    if (track.albumId) {
      const album = await this.albumModel.findById(track.albumId);
      const albumTracks = album.tracks.filter(
        (t) => t._id.toString() !== id.toString(),
      );
      album.tracks = [...albumTracks];
      await album.save();
    }

    return track._id;
  }

  async addComment(dto: CreateCommentDto): Promise<Comment> {
    const track = await this.trackModel.findById(dto.trackId);
    const comment = await this.commentModel.create({ ...dto });
    track.comments.push(comment._id);
    await track.save();
    return comment;
  }

  async listen(id: Types.ObjectId) {
    const track = await this.trackModel.findById(id);
    track.listens += 1;
    track.save();
  }

  async search(query: string): Promise<Track[]> {
    const tracks = await this.trackModel.find({
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { artist: { $regex: new RegExp(query, 'i') } },
      ],
    });
    return tracks;
  }

  async addToFavorites(trackId: Types.ObjectId, accessToken: string) {
    const tokenData = await this.tokenService.validateAccessToken(accessToken);
    if (!tokenData) {
      throw new HttpException(
        'Ошибка валидации токена',
        HttpStatus.BAD_REQUEST,
      );
    }

    const track = await this.trackModel.findById(trackId, { __v: false });
    if (!track) {
      throw new HttpException(
        'Трек с таким id не найден',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findById(tokenData.sub);
    if (!user) {
      throw new HttpException(
        'Неверный id пользователя',
        HttpStatus.BAD_REQUEST,
      );
    }

    await user.favoritesTracks.push(trackId);
    await user.save();

    const { password, __v, ...result } = user['_doc'];

    return result;
  }
}
