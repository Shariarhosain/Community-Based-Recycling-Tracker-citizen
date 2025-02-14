import { MaterialType } from './material-type.enum';
export declare class AddContributionDto {
    recyclingCenterName: string;
    material_type: MaterialType;
    quantity: number;
    picture: string;
    message: string;
}
