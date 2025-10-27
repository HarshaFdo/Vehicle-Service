import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleResolver } from './vehicle.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { VehicleController } from './vehicle.controller';
import { ProcessorModule } from 'src/processor/processor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    ProcessorModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleResolver],
  exports: [VehicleService],
})
export class VehicleModule {}
