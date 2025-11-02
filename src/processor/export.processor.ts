import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';

@Processor('export-queue')
@Injectable()
export class ExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { minAge, userId, sessionHash } = job.data;

    this.logger.log('Job data received:', { minAge, userId, sessionHash });

    const vehicles = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.age_of_vehicle >= :minAge', { minAge })
      .orderBy('vehicle.manufactured_date', 'ASC')
      .getMany();

    this.logger.log('Found vehicles:', vehicles.length);

    const fileName = `export-${Date.now()}.csv`;
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'shared',
      'exports',
      fileName,
    );
    const writeStream = createWriteStream(filePath);

    // Write CSV header
    writeStream.write(
      'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_vehicle\n',
    );

    // Write data rows
    vehicles.forEach((vehicle) => {
      writeStream.write(
        `${vehicle.id},${vehicle.first_name},${vehicle.last_name},${vehicle.email},${vehicle.car_make},${vehicle.car_model},${vehicle.vin},${vehicle.manufactured_date},${vehicle.age_of_vehicle}\n`,
      );
    });

    writeStream.end();

    // Send notification to the notification service
try {
    const payload = {
      userId,
      sessionHash,
      message: `Export completed: ${vehicles.length} vehicles exported`,
      fileName,
      filePath,
    };
    this.logger.log('Sending to notification service:', payload); // Add this line
    
    await firstValueFrom(
      this.httpService.post('http://localhost:3002/notification/send', payload),
    );

    this.logger.log('Notification sent to notification service');
  } catch (error) {
    this.logger.error('Error sending notification:', error);
  }
    return { success: true, count: vehicles.length, fileName };
  }
}
