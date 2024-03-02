import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { EntityType, FileService, FileType } from '../file/file.service';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from './schemas/album.schema';
import { Model, Types } from 'mongoose';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { TokenService } from '../token/token.service';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    private fileService: FileService,
    private tokenService: TokenService,
  ) {}

  async create(dto: CreateAlbumDto, picture): Promise<Album> {
    const picturePath = this.fileService.createFile(
      FileType.IMAGE,
      picture,
      EntityType.ALBUM,
    );
    const album = await this.albumModel.create({
      ...dto,
      picture: picturePath,
      tracks: [],
    });
    return album;
  }

  async getAll(): Promise<Album[]> {
    const albums = await this.albumModel.find();
    return albums;
  }

  async getMyAlbums(userId: Types.ObjectId): Promise<Album[]> {
    const albums = await this.albumModel
      .find({ owner: userId })
      .sort({ createdAt: -1 });
    return albums;
  }

  async getOne(id: string): Promise<Album> {
    const album = await this.albumModel.findById(id);
    return album;
  }

  async delete(
    id: Types.ObjectId,
    accessToken: string,
  ): Promise<Types.ObjectId> {
    const tokenData = this.tokenService.validateAccessToken(accessToken);
    if (!tokenData) {
      throw new UnauthorizedException();
    }

    const album = await this.albumModel.findByIdAndDelete(id);
    if (!album) {
      throw new HttpException('Альбом не найден', HttpStatus.BAD_REQUEST);
    }

    if (tokenData.sub !== album.owner.toString()) {
      throw new HttpException(
        'Нельзя удалить чужой альбом',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (album.tracks.length !== 0) {
      const albumIdString = id.toString();
      await this.trackModel.updateMany(
        { albumId: albumIdString },
        { albumId: null },
      );
    } else {
      this.fileService.removeFile(album.picture);
    }

    return album._id;
  }

  async addTrackToAlbum(
    albumId: Types.ObjectId,
    trackId: Types.ObjectId,
    accessToken: string,
  ) {
    const tokenData = this.tokenService.validateAccessToken(accessToken);
    if (!tokenData) {
      throw new UnauthorizedException();
    }

    const album = await this.albumModel.findById(albumId);
    if (!album) {
      throw new HttpException('Альбом не найден', HttpStatus.BAD_REQUEST);
    }

    if (tokenData.sub !== album.owner.toString()) {
      throw new HttpException(
        'Нельзя добавить трек в чужой альбом',
        HttpStatus.BAD_REQUEST,
      );
    }

    const track = await this.trackModel.findById(trackId);
    if (!track) {
      throw new HttpException('Трек не найден', HttpStatus.BAD_REQUEST);
    }
    track.albumId = albumId;
    await track.save();

    album.tracks.push(track);
    await album.save();

    return track;
  }
}
