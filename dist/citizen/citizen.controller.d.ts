import { CitizenService } from './citizen.service';
import { AddContributionDto } from './dto/add-contribution.dto';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
export declare class CitizenController {
    private readonly citizenService;
    constructor(citizenService: CitizenService);
    addContribution(createContributionDto: AddContributionDto): Promise<RecyclingLog>;
    getRecentContributions(): Promise<RecyclingLog[]>;
    getContributionsByDate(startDate: string, endDate: string): Promise<RecyclingLog[]>;
    getContributionsByQuantity(quantity: number): Promise<RecyclingLog[]>;
    getContributionsByStatus(status: string): Promise<RecyclingLog[]>;
    getImpactDashboard(): Promise<{
        total: number;
        percentageChange: number;
    }>;
    getCO2SavedPerWeek(): Promise<{
        week: string;
        co2Saved: number;
    }[]>;
    getCenterByName(centerName: string): Promise<RecyclingCenter>;
}
