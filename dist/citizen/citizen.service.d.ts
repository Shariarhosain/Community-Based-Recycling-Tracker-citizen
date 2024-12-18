import { Repository } from 'typeorm';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { User } from './Entitys/user.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
import { AddContributionDto } from './dto/add-contribution.dto';
export declare class CitizenService {
    private readonly recyclingLogRepository;
    private readonly userRepository;
    private readonly recyclingCenterRepository;
    constructor(recyclingLogRepository: Repository<RecyclingLog>, userRepository: Repository<User>, recyclingCenterRepository: Repository<RecyclingCenter>);
    private calculateRewardPoints;
    addContribution(createContributionDto: AddContributionDto): Promise<RecyclingLog>;
    getRecentContributions(): Promise<RecyclingLog[]>;
    getContributionsByDate(startDate: Date, endDate: Date): Promise<RecyclingLog[]>;
    getContributionsByQuantity(quantity: number): Promise<RecyclingLog[]>;
    getContributionsByStatus(status: string): Promise<RecyclingLog[]>;
    private getStartOfCurrentWeek;
    private getStartOfPreviousWeek;
    private getEndOfPreviousWeek;
    getImpactDashboard(): Promise<{
        total: number;
        percentageChange: number;
    }>;
    getCO2SavedPerWeek(): Promise<{
        week: string;
        co2Saved: number;
    }[]>;
    private getCO2Factor;
    getCenterByName(centerName: string): Promise<RecyclingCenter>;
}
