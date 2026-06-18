import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { createMulterOptions } from './multer.config';

@Module({
  imports: [MulterModule.register(createMulterOptions())],
  exports: [MulterModule],
})
export class UploadsModule {}
