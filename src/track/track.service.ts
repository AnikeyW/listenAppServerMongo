import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateTrackDto } from './dto/create-track.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileService, FileType } from '../file/file.service';
import { AlbumService } from '../album/album.service';
import { Album, AlbumDocument } from '../album/schemas/album.schema';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    private fileService: FileService,
    private albumService: AlbumService,
  ) {}

  async create(dto: CreateTrackDto, picture, audio): Promise<Track> {
    const audioPath = this.fileService.createFile(FileType.AUDIO, audio);
    const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
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
    const audioPath = this.fileService.createFile(FileType.AUDIO, audio);
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
      .limit(Number(count));
    return tracks;
  }

  async getOne(id: Types.ObjectId): Promise<Track> {
    const track = await this.trackModel.findById(id).populate('comments');
    return track;
  }

  async delete(id: Types.ObjectId): Promise<Types.ObjectId> {
    const track = await this.trackModel.findByIdAndDelete(id);
    const pictureName = this.fileService.removeFile(track.picture);

    const audioName = this.fileService.removeFile(track.audio);
    const album = await this.albumModel.findById(track.albumId);
    const albumTracks = album.tracks.filter(
      (t) => t._id.toString() !== id.toString(),
    );
    album.tracks = [...albumTracks];
    await album.save();

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
      name: { $regex: new RegExp(query, 'i') },
    });
    return tracks;
  }
}
