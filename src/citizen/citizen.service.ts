// recycling-log.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { User } from './Entitys/user.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
import { AddContributionDto } from './dto/add-contribution.dto';

@Injectable()
export class CitizenService {

  constructor(
    @InjectRepository(RecyclingLog)
    private readonly recyclingLogRepository: Repository<RecyclingLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RecyclingCenter)
    private readonly recyclingCenterRepository: Repository<RecyclingCenter>,
  ) {}

  private calculateRewardPoints(quantity: number): number {
    const pointsPerKg = 10;  
    return quantity * pointsPerKg;
  }

  async addContribution(createContributionDto: AddContributionDto): Promise<RecyclingLog> {

    const user = await this.userRepository.findOne({ where: { name: createContributionDto.userName } });
    if (!user) {
      throw new NotFoundException(`User with name ${createContributionDto.userName} not found`);
    }

    const recyclingCenter = await this.recyclingCenterRepository.findOne({ where: { name: createContributionDto.recyclingCenterName } });
    if (!recyclingCenter) {
      throw new NotFoundException(`Recycling center with name ${createContributionDto.recyclingCenterName} not found`);
    }


    const rewardPoints = this.calculateRewardPoints(createContributionDto.quantity);

  
    const recyclingLog = this.recyclingLogRepository.create({
      material_type: createContributionDto.material_type,
      quantity: createContributionDto.quantity,
      status: 'Pending', 
      reward_points: rewardPoints,
      timestamp: new Date(),  
      image: createContributionDto.picture,  
      message: createContributionDto.message, 
      user: user,
    
      recycling_center: recyclingCenter,
    });


    return await this.recyclingLogRepository.save(recyclingLog);
  }

  
  async getRecentContributions(): Promise<RecyclingLog[]> {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 15);

    return this.recyclingLogRepository.find({
      where: {
        timestamp: Between(pastDate, currentDate),
      },
    });
    }


    
    async getContributionsByDate(startDate: Date, endDate: Date): Promise<RecyclingLog[]> {

        return this.recyclingLogRepository.find({
            where: {
            timestamp: Between(startDate, endDate),
            },
        });
        }
    
   
    async getContributionsByQuantity(quantity: number): Promise<RecyclingLog[]> {

        return this.recyclingLogRepository.find({
            where: {
            quantity: quantity,
            },
        });
        }
   
    async getContributionsByStatus(status: string): Promise<RecyclingLog[]> {

        return this.recyclingLogRepository.find({
            where: {
            status: status,
            },
        });
        }



// impact dashboard


private getStartOfCurrentWeek(): Date {
    const date = new Date();
    const dayOfWeek = date.getDay(); 
    date.setDate(date.getDate() - dayOfWeek);

    return date;
  }
  
 
  private getStartOfPreviousWeek(): Date {
    const date = this.getStartOfCurrentWeek();
    date.setDate(date.getDate() - 7); 
    return date;
  }
  

  private getEndOfPreviousWeek(): Date {
    const date = this.getStartOfCurrentWeek();
    date.setDate(date.getDate() - 1); 

    return date;
  }


  async getImpactDashboard(): Promise<{ total: number; percentageChange: number }> {

    const total = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog')
      .select('SUM(recyclingLog.quantity)', 'total')
      .getRawOne();
  
   
    const currentWeek = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog')
      .select('SUM(recyclingLog.quantity)', 'total')
      .where('recyclingLog.timestamp >= :startDate', {
        startDate: this.getStartOfCurrentWeek(),
      })
      .getRawOne();
  

    const previousWeek = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog')
      .select('SUM(recyclingLog.quantity)', 'total')
      .where('recyclingLog.timestamp BETWEEN :startDate AND :endDate', {
        startDate: this.getStartOfPreviousWeek(),
        endDate: this.getEndOfPreviousWeek(),
      })
      .getRawOne();
  

  
    
    const current = parseFloat(currentWeek?.total || '0');
    const previous = parseFloat(previousWeek?.total || '0');
  
   
    let percentageChange = 0;
    if (previous === 0 && current > 0) {
      percentageChange = 100; 
    } else if (previous > 0) {
      percentageChange = ((current - previous) / previous) * 100;
    }

    return {
      total: parseInt(total?.total || '0', 10),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    };
  }

  



  async getCO2SavedPerWeek(): Promise<{ week: string; co2Saved: number }[]> {
   
    const contributions = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog')
      .select("TO_CHAR(recyclingLog.timestamp, 'IYYY-IW')", 'week') 
      .addSelect('SUM(recyclingLog.quantity)', 'totalQuantity') 
      .addSelect("recyclingLog.material_type", 'materialType')
      .groupBy("TO_CHAR(recyclingLog.timestamp, 'IYYY-IW')")
      .addGroupBy('recyclingLog.material_type')
      .orderBy('week', 'ASC')
      .getRawMany();

    const weeklyCO2 = contributions.reduce((acc, record) => {
      const week = record.week;
      const materialType = record.materialType;
      const quantity = parseFloat(record.totalQuantity) || 0;

      const co2Factor = this.getCO2Factor(materialType);
      const co2Saved = quantity * co2Factor;

      
      if (!acc[week]) {
        acc[week] = { week, co2Saved: 0 };
      }

      acc[week].co2Saved += co2Saved;

      return acc;
    }, {});

    
    return Object.values(weeklyCO2).map((item: any) => ({
      week: item.week,
      co2Saved: parseFloat(item.co2Saved.toFixed(2)), 
    }));
  }


  private getCO2Factor(materialType: string): number {
    const factors: Record<string, number> = {
      Plastic: 1.5, 
      Metal: 2.2,   
      Glass: 0.9,   
      Paper: 1.2,   
    };
    return factors[materialType] || 0; 
  }







  // Search for a recycling center by its name
  async getCenterByName(centerName: string): Promise<RecyclingCenter> {
    const center = await this.recyclingCenterRepository.findOne({
      where: { name: centerName },
    });

    if (!center) {
      throw new NotFoundException(`Recycling center with name '${centerName}' not found`);
    }

    return center;
  }
}


  




