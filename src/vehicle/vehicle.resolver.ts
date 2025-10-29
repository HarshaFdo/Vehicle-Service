import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver, ResolveReference } from '@nestjs/graphql';
import { VehicleService } from './vehicle.service';
import { Vehicle } from '../entities/vehicle.entity';
import { PaginatedVehicle } from './dto/paginated-result.dto';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { ServiceRecord } from 'src/stubs/service-record.stub';


@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => PaginatedVehicle, { name: 'getAllVehicles' })
  findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ): Promise<PaginatedVehicle> {
    return this.vehicleService.findAll(page, limit);
  }

  @Query(() => PaginatedVehicle, {
    name: 'searchVehicles',
  })
  async search(
    @Args('model', {
      type: () => String,
      description: 'The car model pattern to search for.',
    })
    model: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ): Promise<PaginatedVehicle> {
    return this.vehicleService.search(model, page, limit);
  }

  @Query(() => Vehicle, { name: 'getVehicle' })
  findOne(@Args('vin', { type: () => String }) vin: string) {
    return this.vehicleService.findOne(vin);
  }

  @Query(() => [Vehicle])
  async searchByAge(
    @Args('minAge', { type: () => Int }) minAge: number,
  ): Promise<Vehicle[]> {
    return this.vehicleService.findByAge(minAge);
  }

  @Mutation(() => Vehicle)
  updateVehicle(
    @Args('vin', { type: () => String }) vin: string,
    @Args('updateData', { type: () => UpdateVehicleInput })
    updateData: UpdateVehicleInput,
  ) {
    return this.vehicleService.update(vin, updateData);
  }

  @Mutation(() => Boolean)
  deleteVehicle(@Args('vin', { type: () => String }) vin: string) {
    return this.vehicleService.delete(vin).then(() => true);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; vin: string }) {
    return this.vehicleService.findByVin(reference.vin);
  }
}
