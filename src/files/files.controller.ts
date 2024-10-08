import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      //limits: { fileSize: 1024 * 1024 * 5 }, 
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Make sure the file is a image');
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {secureUrl};
  }

  @Get('product/:imageName')
  findProductImage(@Res() res:Response, @Param('imageName') imageName: string ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }
}
