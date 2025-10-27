import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { ImportProcessor } from './import.processor';
import { ExportProcessor } from './export.processor';
import { HttpModule } from '@nestjs/axios';
import { ProcessorService } from './processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    HttpModule,
    BullModule.registerQueue({
      name: 'import-queue',
    }),
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  providers: [ImportProcessor, ExportProcessor, ProcessorService],
  exports: [ProcessorService],
  controllers: [],
})
export class ProcessorModule {}
