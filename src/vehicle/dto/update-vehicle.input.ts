import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  last_name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  car_make?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  car_model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  manufactured_date?: Date;
}