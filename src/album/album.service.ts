import { Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { FileService, FileType } from '../file/file.service';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from './schemas/album.schema';
import { Model, ObjectId } from 'mongoose';
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

  async getOne(id: ObjectId): Promise<Album> {
    const album = await this.albumModel.findById(id);
    return album;
  }

  async delete(id: ObjectId): Promise<ObjectId> {
    const album = await this.albumModel.findById(id);

    if (!album) {
      throw new Error('Альбом не найден');
    }

    await this.trackModel.updateMany({ albumId: album._id }, { albumId: null });

    await album.deleteOne();

    const fileName = this.fileService.removeFile(album.picture);

    return album._id;
  }

  async addTrackToAlbum(albumId: ObjectId, track: Track) {
    const album = await this.albumModel.findById(albumId);
    if (album) {
      album.tracks.push(track);
      await album.save();
    } else {
      throw new Error('Альбом не найден');
    }
  }
}
