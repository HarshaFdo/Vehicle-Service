import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
const csvParser = require('csv-parser');
import { createReadStream, unlinkSync } from 'fs';
import { Vehicle } from 'src/entities/vehicle.entity';
import { Repository } from 'typeorm';
const XLSX = require('xlsx');

@Processor('import-queue')
@Injectable()
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      this.logger.log('Processing job:', job.id, job.data);

      const { filePath, fileType } = job.data;
      const vehicles = [];

      if (fileType === 'csv') {
        await this.processCSV(filePath, vehicles);
      } else if (fileType === 'excel') {
        await this.processExcel(filePath, vehicles);
      }

      this.logger.log('Parsed vehicles:', vehicles.length);
      this.logger.log('Vehicle data:', vehicles);

      // Save vehicles one by one, skip duplicates
      let successCount = 0;
      let skipCount = 0;

      for (const vehicle of vehicles as any[]) {
        try {
          // Save to the database
          await this.vehicleRepository.save(vehicle);
          successCount++;
        } catch (error: any) {
          if (error.code === '23505') {
            // if duplicated vin , should skip the record
            this.logger.log(`skipping duplicate vin: ${vehicle.vin}`);
            skipCount++;
          } else {
            throw error;
          }
        }
      }
      this.logger.log(`Saved: ${successCount}, Skipped: ${skipCount}`);

      // Delete file after processsing
      unlinkSync(filePath);

      this.logger.log('File deleted');

      return {
        success: true,
        saved: successCount,
        skipped: skipCount,
        count: vehicles.length,
      };
    } catch (error) {
      this.logger.error('Error processing job:', error);
      throw error;
    }
  }

  private processCSV(filePath: string, vehicles: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          vehicles.push(this.mapToVehicle(row));
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  private async processExcel(filePath: string, vehicles: any[]) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    rows.forEach((row: any) => {
      vehicles.push(this.mapToVehicle(row));
    });
  }

  private mapToVehicle(row: any): Partial<Vehicle> {
    const manufacturedDate = new Date(row.manufactured_date);
    const ageOfVehicle =
      new Date().getFullYear() - manufacturedDate.getFullYear();

    return {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      car_make: row.car_make,
      car_model: row.car_model,
      vin: row.vin,
      manufactured_date: manufacturedDate,
      age_of_vehicle: ageOfVehicle,
    };
  }
}
