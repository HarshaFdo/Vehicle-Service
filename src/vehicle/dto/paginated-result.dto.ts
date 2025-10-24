import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Vehicle } from "src/entities/vehicle.entity";

@ObjectType()
export class PaginatedVehicle {
  @Field(()=>[Vehicle])
  data: Vehicle[];

  @Field(() => Int)
  total: number;

  @Field(() => Int) 
  page: number;

  @Field(() => Int)
  totalPages: number;
}
