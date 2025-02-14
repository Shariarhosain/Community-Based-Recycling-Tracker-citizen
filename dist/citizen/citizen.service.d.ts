import { Repository } from 'typeorm';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { User } from './Entitys/user.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
import { AddContributionDto } from './dto/add-contribution.dto';
import { MailerService } from 'src/mailer/mailer.service';
export declare class CitizenService {
    private readonly recyclingLogRepository;
    private readonly userRepository;
    private readonly recyclingCenterRepository;
    private MailerService;
    constructor(recyclingLogRepository: Repository<RecyclingLog>, userRepository: Repository<User>, recyclingCenterRepository: Repository<RecyclingCenter>, MailerService: MailerService);
    private calculateRewardPoints;
    addContribution(createContributionDto: AddContributionDto, user: any): Promise<RecyclingLog>;
    uploadImage(image: Express.Multer.File): Promise<void>;
    findAll2(userInfo: any): Promise<RecyclingLog[]>;
    getRecentContributions(userInfo: any): Promise<RecyclingLog[]>;
    getContributionsByDate(startDate: Date, endDate: Date, userInfo: any): Promise<RecyclingLog[]>;
    getContributionsByQuantity(quantity: number, userInfo: any): Promise<RecyclingLog[]>;
    getContributionsByStatus(status: string, userInfo: any): Promise<RecyclingLog[]>;
    private getStartOfCurrentMonthToToday;
    private getStartOfPreviousMonth;
    private getEndOfPreviousMonthSameDay;
    getImpactDashboard(userInfo: any): Promise<{
        total: number;
        percentageChange: number;
    }>;
    getCO2SavedPerWeek(userInfo: any): Promise<{
        week: string;
        co2Saved: number;
    }[]>;
    private getCO2Factor;
    findAll(): Promise<any[]>;
    getCoordinates(location: string): Promise<{
        latitude: number;
        longitude: number;
    }>;
}
