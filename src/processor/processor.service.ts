import { InjectQueue } from '@nestjs/bullmq';
import { Injectable} from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class ProcessorService {
  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    @InjectQueue('export-queue') private exportQueue: Queue,
  ) {}

  async importJob(data: { filePath: string; fileType: string }) {
    const job = await this.importQueue.add('import-job', {
      filePath: data.filePath,
      fileType: data.fileType,
    });

    console.log('Job added to queue:', job.id);
  }

  async exportJob(data: { minAge: number; userId: string }) {
    const job = await this.exportQueue.add('export-job', {
      minAge: data.minAge,
      userId: data.userId,
    });

    console.log('Export Job added to queue:', job.id);
  }
}
