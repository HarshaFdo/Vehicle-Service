import { IsNumber, IsString, Min } from 'class-validator';

export class ExportVehicleDto {
  @IsNumber()
  @Min(0)
  minAge: number;

  @IsString()
  userId: string;
}