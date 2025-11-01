import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Like, Repository } from 'typeorm';
import { PaginatedVehicle } from './dto/paginated-result.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedVehicle> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.vehicleRepository.findAndCount({
      order: { manufactured_date: 'ASC' },
      skip,
      take: limit, // 100 records per page
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(vin: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne({ where: { vin } });
  }

  async search(model: string, page: number = 1, limit: number = 100) {
     console.log(`Searching vehicles by model: ${model}`);

    const skip = (page - 1) * limit;
    const searchPattern = model.replace('*', '%');

    const [data, total] = await this.vehicleRepository.findAndCount({
      where: { car_model: Like(searchPattern) },
      order: { manufactured_date: 'ASC' },
      skip,
      take: limit,
    });

    console.log(`Found ${total} vehicle(s) matching model: ${model}`);
    
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(vin: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    console.log(`\nUpdating vehicle with VIN ${vin}:`, updateData);

    await this.vehicleRepository.update({ vin }, updateData);
    console.log(`Vehicle with VIN ${vin} updated successfully.`);

    return this.findOne(vin);
  }

  async delete(vin: string): Promise<void> {
    console.log(`\nDeleting vehicle with VIN ${vin}`);
    await this.vehicleRepository.delete({ vin });

    console.log(`Vehicle with VIN ${vin} deleted successfully.`);
  }

  async findByAge(minAge: number) {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.age_of_vehicle >= :minAge', { minAge })
      .getMany();
  }

  async findByVin(vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vin },
    });
    if (!vehicle)
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    return vehicle;
  }
}
