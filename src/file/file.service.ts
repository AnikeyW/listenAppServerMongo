import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as mm from 'music-metadata';
import * as mime from 'mime-types';

export enum FileType {
  AUDIO = 'audio',
  IMAGE = 'image',
}

export enum EntityType {
  ALBUM = 'album',
  TRACK = 'track',
  USER = 'user',
}

@Injectable()
export class FileService {
  createFile(type: FileType, file, entityType: EntityType): string {
    try {
      const fileExtension = mime.extension(file.mimetype);
      const fileName = uuid.v4() + '.' + fileExtension;
      let filePath;
      if (type === FileType.IMAGE) {
        filePath = path.resolve(
          __dirname,
          '..',
          '..',
          'static',
          type,
          entityType,
        );
      } else {
        filePath = path.resolve(__dirname, '..', '..', 'static', type);
      }
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);
      return type === FileType.IMAGE
        ? type + '/' + entityType + '/' + fileName
        : type + '/' + fileName;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getAudioDuration(audioBuffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      mm.parseBuffer(audioBuffer, 'audio/mpeg', { duration: true })
        .then((metadata) => {
          if (metadata.format && metadata.format.duration) {
            resolve(Math.ceil(metadata.format.duration));
          } else {
            reject(new Error('Не удалось получить длительность аудиофайла.'));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  removeFile(fileName: string) {
    try {
      const filePath = path.resolve(__dirname, '..', '..', 'static', fileName);
      fs.unlinkSync(filePath);
      console.log(`File ${fileName} has been deleted.`);
      return fileName;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
