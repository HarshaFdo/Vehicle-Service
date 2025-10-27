import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { firstValueFrom } from 'rxjs';
import { ExportVehicleDto } from './dto/export-vehicle.dto';
import { ProcessorService } from 'src/processor/processor.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly processorService: ProcessorService) {}

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

    // Call background process
    await this.processorService.importJob( {
        filePath: file.path,
        fileType: type,
      });

    return { message: 'File uploaded successfully. Processing in background.' };
  }

  @Post('export')
  async exportVehicles(@Body() data: ExportVehicleDto) {
    // Call background-service API
    await this.processorService.exportJob({
        minAge: data.minAge,
        userId: data.userId,
        sessionHash: data.sessionHash,
      })

    return {
      message:
        'Export job queued. You will receive notification when complete.',
    };
  }

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res) {
  const filePath = path.join(__dirname, '..', '..', '..', 'shared', 'exports', fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new BadRequestException('File not found');
  }

   res.download(filePath, fileName);
}
}
