import { S3 } from 'aws-sdk';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
const sharp = require('sharp');

@Injectable()
export class UploadService {
  image_mimetypes = ['image/jpeg', 'image/png', 'image/webp'];
  constructor(private readonly configService: ConfigService<IConfig>) {}

  private generateFileName(ext: string): string {
    return `${uuid()}-${new Date().getTime()}.${ext}`;
  }

  async processImage(file: Express.Multer.File): Promise<[string, Buffer]> {
    const fileName = this.generateFileName('webp');
    const buffer = await sharp(file.buffer).webp({ quality: 20 }).toBuffer();
    return [fileName, buffer];
  }

  async processOther(file: Express.Multer.File): Promise<[string, Buffer]> {
    const ext = file.originalname.split('.').pop();
    if (!ext) throw new BadRequestException('File extension not found');

    const fileName = this.generateFileName(ext);
    return [fileName, file.buffer];
  }

  async upload(file: Express.Multer.File) {
    // Get the extension of the provided file
    const [fileName, buffer] = this.image_mimetypes.includes(file.mimetype)
      ? await this.processImage(file)
      : await this.processOther(file);
    const bucketS3 = this.configService.get('aws.s3.bucket', { infer: true })!;
    return this.uploadS3(buffer, bucketS3, fileName, file.mimetype);
  }

  async uploadS3(
    file: Buffer,
    bucket: string,
    filename: string,
    mimeType?: string,
  ) {
    const s3 = await this.getS3();
    const params: S3.Types.PutObjectRequest = {
      Bucket: bucket,
      Key: filename,
      Body: file,
      ContentType: mimeType,
    };

    try {
      await s3.upload(params).promise();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
    return { filename: filename };
  }

  async getSignedUrl(key: string) {
    const bucketS3 = this.configService.get('aws.s3.bucket', { infer: true })!;
    const s3 = await this.getS3();
    const params = {
      Bucket: bucketS3,
      Key: key,
      Expires: 60,
    };
    const url = s3.getSignedUrl('getObject', params);
    return { url };
  }

  async getS3() {
    return new S3({
      accessKeyId: await this.configService.get('aws.accessKeyId', {
        infer: true,
      }),
      secretAccessKey: await this.configService.get('aws.secretAccessKey', {
        infer: true,
      }),
      region: await this.configService.get('aws.s3.region', { infer: true }),
    });
  }
}
