import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';
import slugify from 'slugify';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export const FileUploadInterceptor = () =>
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, callback) => {
        const uploadPath = './public/images';
        const ext = extname(file.originalname);
        const originalName = basename(file.originalname, ext);

        const slug = slugify(originalName, { lower: true, strict: true });
        let filename = `${slug}${ext}`;
        let counter = 1;

        while (existsSync(join(uploadPath, filename))) {
          filename = `${slug}-${counter}${ext}`;
          counter++;
        }

        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            'Chỉ cho phép upload file hình ảnh (jpeg, png, jpg, webp)',
          ),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });
