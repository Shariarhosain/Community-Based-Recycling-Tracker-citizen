import { MaterialType } from './material-type.enum';
export declare class AddContributionDto {
    userName: string;
    recyclingCenterName: string;
    material_type: MaterialType;
    quantity: number;
    picture: string;
    message: string;
}
