import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async handleUploadedFile(file: Express.Multer.File, user: User) {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }
    const newFile = await this.fileRepository.save({
      path: file?.filename,
      user_id: user.id,
    });

    return {
      message: 'File uploaded successfully',
      filename: file?.filename,
      fileId: newFile.id,
    };
  }
}
