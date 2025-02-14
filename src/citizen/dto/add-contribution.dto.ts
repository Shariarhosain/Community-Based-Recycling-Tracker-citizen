// add-contribution.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaterialType } from './material-type.enum';

export class AddContributionDto {

    @IsString()
    @IsNotEmpty({ message: 'Recycling center name is required' })
    recyclingCenterName: string;

    @IsEnum(MaterialType)
    material_type: MaterialType; 


  @IsNumber()
  quantity: number; 

  @IsOptional()
  @IsString()
  picture: string; 

  @IsOptional()
  @IsString()
  message: string; 
}
