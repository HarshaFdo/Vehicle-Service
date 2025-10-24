import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Queue } from "bullmq";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller('vehicle')
export class VehicleController {
    constructor(
        @InjectQueue('import-queue') private importQueue:Queue,
    ){}

    @Post('import')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb)=>{
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9);
                    cb (null, `${uniqueSuffix}${extname(file.originalname)}`)
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

    await this.importQueue.add('import-job', {
      filePath: file.path,
      fileType: type,
    });

    return { message: 'File uploaded successfully. Processing in background.' };
  }
}


