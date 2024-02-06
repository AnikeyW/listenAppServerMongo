import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import * as path from 'path'
import * as fs from 'fs'
import * as uuid from 'uuid'
import * as mm from 'music-metadata';

export enum FileType {
    AUDIO = 'audio',
    IMAGE = 'image'
}

@Injectable()
export class FileService{

    createFile(type: FileType, file): string {
        try {
            const fileExtension = file.originalname.split('.').pop()
            const fileName = uuid.v4() + '.' + fileExtension
            const filePath = path.resolve(__dirname, '..', 'static', type)
            if(!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true})
            }
            fs.writeFileSync(path.resolve(filePath, fileName), file.buffer)
            return type + '/' + fileName
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    getAudioDuration(audioBuffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            mm.parseBuffer(audioBuffer, 'audio/mpeg', { duration: true })
                .then(metadata => {
                    if (metadata.format && metadata.format.duration) {
                        resolve(Math.ceil(metadata.format.duration));
                    } else {
                        reject(new Error('Не удалось получить длительность аудиофайла.'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    removeFile(fileName: string) {

    }

}