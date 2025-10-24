import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './vehicle.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(page: number = 1, limit: number = 100) {
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
    const skip = (page - 1) * limit;
    const searchPattern = model.replace('*', '%');

    const [data, total] = await this.vehicleRepository.findAndCount({
      where: { car_model: Like(searchPattern) },
      order: { manufactured_date: 'ASC' },
      skip,
      take: limit,
    });
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(vin: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    await this.vehicleRepository.update({ vin }, updateData);
    return this.findOne(vin);
  }

  async delete(vin: string): Promise<void> {
    await this.vehicleRepository.delete({ vin });
  }

  async findByAge(minAge: number) {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.age_of_vehicle >= :minAge', { minAge })
      .getMany();
  }
}
