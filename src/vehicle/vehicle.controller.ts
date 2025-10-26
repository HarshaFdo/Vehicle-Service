import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bullmq';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { firstValueFrom } from 'rxjs';
import { ExportVehicleDto } from './dto/export-vehicle.dto';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly httpService: HttpService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'shared', 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async importFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileType = extname(file.originalname).toLowerCase();
    let type: string;

    if (fileType === '.csv') {
      type = 'csv';
    } else if (fileType === '.xlsx' || fileType === '.xls') {
      type = 'excel';
    } else {
      throw new BadRequestException('Only CSV and Excel files are allowed');
    }

    // Call background-service API
    await firstValueFrom(
      this.httpService.post('http://localhost:3001/job/import', {
        filePath: file.path,
        fileType: type,
      }),
    );

    return { message: 'File uploaded successfully. Processing in background.' };
  }

  @Post('export')
  async exportVehicles(@Body() data: ExportVehicleDto) {
    // Call background-service API
    await firstValueFrom(
      this.httpService.post('http://localhost:3001/job/export', {
        minAge: data.minAge,
        userId: data.userId,
      }),
    );

    return {
      message:
        'Export job queued. You will receive notification when complete.',
    };
  }
}
