import { CitizenService } from './citizen.service';
import { AddContributionDto } from './dto/add-contribution.dto';
import { RecyclingLog } from './Entitys/recycling-log.entity';
export declare class CitizenController {
    private readonly citizenService;
    constructor(citizenService: CitizenService);
    addContribution(userInfo: any, createContributionDto: AddContributionDto): Promise<RecyclingLog>;
    uploadImage(image: Express.Multer.File): Promise<{
        message: string;
        image: Express.Multer.File;
    }>;
    getRecentContributions(userInfo: any): Promise<RecyclingLog[]>;
    getContributionsByDate(userInfo: any, getContributionsByDate: any): Promise<RecyclingLog[]>;
    showAllContributions(userInfo: any): Promise<RecyclingLog[]>;
    checkAuth(req: any): Promise<{
        message: string;
        user: any;
    }>;
    getContributionsByQuantity(userInfo: any, quantity: number): Promise<RecyclingLog[]>;
    getContributionsByStatus(userInfo: any, status: string): Promise<RecyclingLog[]>;
    getImpactDashboard(userInfo: any): Promise<{
        total: number;
        percentageChange: number;
    }>;
    getCO2SavedPerWeek(userInfo: any): Promise<{
        week: string;
        co2Saved: number;
    }[]>;
    showAll(): Promise<any[]>;
}
