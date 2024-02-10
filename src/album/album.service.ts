import { Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { FileService, FileType } from '../file/file.service';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from './schemas/album.schema';
import { Model, Types } from 'mongoose';
import { Track, TrackDocument } from '../track/schemas/track.schema';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    private fileService: FileService,
  ) {}

  async create(dto: CreateAlbumDto, picture): Promise<Album> {
    const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
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

  async getOne(id: string): Promise<Album> {
    const album = await this.albumModel.findById(id);
    return album;
  }

  async delete(id: Types.ObjectId): Promise<Types.ObjectId> {
    const album = await this.albumModel.findByIdAndDelete(id);

    if (!album) {
      throw new Error('Альбом не найден');
    }

    const albumIdString = id.toString();
    await this.trackModel.updateMany(
      { albumId: albumIdString },
      { albumId: null },
    );

    if (album.tracks.length === 0) {
      const fileName = this.fileService.removeFile(album.picture);
    }

    return album._id;
  }

  async addTrackToAlbum(albumId: Types.ObjectId, trackId: Types.ObjectId) {
    const album = await this.albumModel.findById(albumId);
    if (!album) {
      throw new Error('Альбом не найден');
    }

    const track = await this.trackModel.findById(trackId);
    track.albumId = albumId;
    await track.save();

    album.tracks.push(track);
    await album.save();

    return track;
  }
}
