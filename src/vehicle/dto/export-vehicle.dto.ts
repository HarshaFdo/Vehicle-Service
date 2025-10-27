import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ExportVehicleDto {
  @IsNumber()
  @Min(0)
  minAge: number;

  @IsNotEmpty()
  @IsString()
  userId: string; 
  
  @IsString()
  sessionHash: string;
}