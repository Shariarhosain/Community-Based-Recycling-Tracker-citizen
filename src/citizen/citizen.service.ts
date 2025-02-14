
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { User } from './Entitys/user.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
import { AddContributionDto } from './dto/add-contribution.dto';
import { MailerService } from 'src/mailer/mailer.service';
import axios from 'axios';
import { MESSAGES } from '@nestjs/core/constants';
import { response } from 'express';
import * as fs from 'fs';
import * as path from 'path';  // Correct import



@Injectable()
export class CitizenService {

  constructor(
    @InjectRepository(RecyclingLog)
    private readonly recyclingLogRepository: Repository<RecyclingLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RecyclingCenter)
    private readonly recyclingCenterRepository: Repository<RecyclingCenter>,

    private MailerService:MailerService


  ) {}



  
  private calculateRewardPoints(quantity: number): number {
    const pointsPerKg = 10;  
    return quantity * pointsPerKg;
  }

  async addContribution(createContributionDto: AddContributionDto, user:any): Promise<RecyclingLog> {
  
    if(user.role !== 'Citizen'){
      throw new HttpException('Only citizens can contribute', HttpStatus.FORBIDDEN);
    }
    
      const use = await this.userRepository.findOne({ where: { email: user.email } });
  
    if (!use) {
      throw new NotFoundException(`User with name ${name} not found`);
    }

    const recyclingCenter = await this.recyclingCenterRepository.findOne({ where: { name: createContributionDto.recyclingCenterName } });
    if (!recyclingCenter) {
      throw new NotFoundException(`Recycling center with name ${createContributionDto.recyclingCenterName} not found`);
    }

    
  
    const acceptedMaterials = recyclingCenter.material_types_accepted.split(',').map(material => material.trim().toLowerCase());
    if (!acceptedMaterials.includes(createContributionDto.material_type.toLowerCase())) {
      throw new BadRequestException(
        `Material type "${createContributionDto.material_type}" is not accepted by the recycling center "${recyclingCenter.name}". Accepted materials are: ${acceptedMaterials.join(', ')}`
      );
    }


   
  
    const recyclingLog = this.recyclingLogRepository.create({
      material_type: createContributionDto.material_type,
      quantity: createContributionDto.quantity,
      status: 'Pending', 
      reward_points: 0,
      timestamp: new Date(),  
      image: createContributionDto.picture,  
      message: createContributionDto.message, 
      user: use,
      recycling_center: recyclingCenter,

    });

    const citigenEmail = user.email;
    const recyclingEmail = await this.recyclingCenterRepository
      .createQueryBuilder('recycling_center')
      .select('user.email', 'email') 
      .innerJoin('recycling_center.user', 'user') 
      .where('recycling_center.name = :name', { name: recyclingCenter.name })
      .getRawOne();
    await this.MailerService.sendMail(citigenEmail, 'Recycling Log', ` Your recycling log has been successfully submitted to ${recyclingCenter.name} center. You will be notified once it is approved.  Details:   Material Type: ${createContributionDto.material_type}   Quantity: ${createContributionDto.quantity}   Status: Pending   Reward Points: 0   Timestamp: ${new Date()}   Image: ${createContributionDto.picture}   Message: ${createContributionDto.message} `); 
     await this.MailerService.sendMail(recyclingEmail.email, 'Recycling Log', ` A new recycling log has been submitted to your center${recyclingCenter.name} by ${use.name}. Please review and approve it.  Details:   Material Type: ${createContributionDto.material_type}   Quantity: ${createContributionDto.quantity}   Status: Pending   Reward Points: 0  Timestamp: ${new Date()}   Image: ${createContributionDto.picture}   Message: ${createContributionDto.message} `);

    return await this.recyclingLogRepository.save(recyclingLog);
    
    
  }
  async uploadImage(image: Express.Multer.File): Promise<void> {
    if (!image || !image.buffer) {
      throw new Error('No valid image buffer available');
    }
  
    // Define the directory to save the image
    const uploadPath = path.join(__dirname, '../../uploads');
    
    // Check if the uploads directory exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  
    // Use the original file name (image.originalname) without any changes
    const imageName = image.originalname;  // This keeps the original file name
  
    // Define the full file path where the image will be saved
    const filePath = path.join(uploadPath, imageName);
  
    // Write the image buffer to the file system
    fs.writeFileSync(filePath, image.buffer);
  
    console.log(`Image saved with original name: ${imageName}`);
  }
  async findAll2(userInfo): Promise<RecyclingLog[]> {
    const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
    if(user.role !== 'Citizen'){
      throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
    }
    const contributions = await this.recyclingLogRepository
    .createQueryBuilder('recyclingLog') // Define alias for recyclingLog
      .innerJoin('recyclingLog.recycling_center', 'recyclingCenter') // Ensure proper relation
      .where('recyclingLog.user = :user', { user: user.id })
      .orderBy('recyclingLog.timestamp', 'DESC')
      .select([
          'recyclingLog.id',
          'recyclingLog.material_type',
          'recyclingLog.quantity',
          'recyclingLog.status',
          'recyclingLog.reward_points',
          'recyclingLog.timestamp',
          'recyclingLog.image',
          'recyclingLog.message',
          'recyclingCenter.name', // Explicitly select recycling center name
      ])
      .getMany();
    
    if (!contributions) {
      throw new NotFoundException('No contributions found');
    }
    return contributions;
  }
  

  async getRecentContributions(userInfo): Promise<RecyclingLog[]> {
    const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
    if(user.role !== 'Citizen'){
      throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
    }
   
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 20);
      const contribution = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog') // Define alias for recyclingLog
      .innerJoin('recyclingLog.recycling_center', 'recyclingCenter') // Ensure proper relation
      .where('recyclingLog.user = :user', { user: user.id })
      .andWhere('recyclingLog.timestamp BETWEEN :pastDate AND :currentDate', { pastDate, currentDate })
      .orderBy('recyclingLog.timestamp', 'DESC')
      .select([
          'recyclingLog.id',
          'recyclingLog.material_type',
          'recyclingLog.quantity',
          'recyclingLog.status',
          'recyclingLog.reward_points',
          'recyclingLog.timestamp',
          'recyclingLog.image',
          'recyclingLog.message',
          'recyclingCenter.name', // Explicitly select recycling center name
      ])
      .getMany();
  
  
  
  

    if (!contribution) {
      throw new NotFoundException('No contributions found');
    }
    return contribution;
  
    }


    
    async getContributionsByDate(startDate: Date, endDate: Date,userInfo:any): Promise<RecyclingLog[]> {

      const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
      if(user.role !== 'Citizen'){
        throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
      }
      const ContributionsByDate= await this.recyclingLogRepository
        .createQueryBuilder('recyclingLog')
        .where('recyclingLog.user = :user', { user: user.id })
        .andWhere('recyclingLog.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
        .orderBy('recyclingLog.timestamp', 'DESC')
        .getMany();
      if (!ContributionsByDate) {
        throw new NotFoundException('No contributions found');
      }
      return ContributionsByDate;

        }
    
   
    async getContributionsByQuantity(quantity: number, userInfo): Promise<RecyclingLog[]> {

      const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
      if(user.role !== 'Citizen'){
        throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
      }
      const ContributionsByQuantity= await this.recyclingLogRepository
        .createQueryBuilder('recyclingLog')
        .where('recyclingLog.user = :user', { user: user.id })
        .andWhere('recyclingLog.quantity >= :quantity', { quantity })
        .orderBy('recyclingLog.quantity', 'DESC')
        .getMany();
      if (!ContributionsByQuantity) {
        throw new NotFoundException('No contributions found');
      }
      return ContributionsByQuantity;
        }
   
    async getContributionsByStatus(status: string,userInfo): Promise<RecyclingLog[]> {

      const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
      if(user.role !== 'Citizen'){
        throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
      }
      const ContributionsByStatus= await this.recyclingLogRepository
        .createQueryBuilder('recyclingLog')
        .where('recyclingLog.user = :user', { user: user.id })
        .andWhere('recyclingLog.status = :status', { status })
        .orderBy('recyclingLog.timestamp', 'DESC')
        .getMany();
      if (!ContributionsByStatus) {
        throw new NotFoundException('No contributions found');
      }
      return ContributionsByStatus;
        }


        private getStartOfCurrentMonthToToday(): { start: Date; end: Date } {
          const start = new Date();
          start.setUTCDate(1); // Set to the first day of the current month
          start.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
        
          const end = new Date(); // Today's date
          end.setUTCHours(23, 59, 59, 999); // Set to the end of today UTC
        
          return { start, end };
        }
        
        private getStartOfPreviousMonth(): Date {
          const date = new Date();
          date.setUTCMonth(date.getUTCMonth() - 1); // Go to the previous month
          date.setUTCDate(1); // Set to the first day of that month
          date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
          return date;
        }
        
        private getEndOfPreviousMonthSameDay(): Date {
          const today = new Date();
          const previousMonth = new Date();
          previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1); // Go to previous month
          previousMonth.setUTCDate(today.getUTCDate()); // Match the same day as today
          previousMonth.setUTCHours(23, 59, 59, 999); // End of the day in UTC
          return previousMonth;
        }
      
        async getImpactDashboard(userInfo): Promise<{ total: number; percentageChange: number }> {
          const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
      
          if (user.role !== 'Citizen') {
            throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
          }
      
          // Get date ranges
          const { start: startOfCurrentMonth, end: today } = this.getStartOfCurrentMonthToToday();
          const startOfPreviousMonth = this.getStartOfPreviousMonth();
          const endOfPreviousMonth = this.getEndOfPreviousMonthSameDay();
      
          console.log('Start of Current Month:', startOfCurrentMonth);
          console.log('End (Today’s Date):', today);
          console.log('Start of Previous Month:', startOfPreviousMonth);
          console.log('End of Previous Month (Matching Today’s Day):', endOfPreviousMonth);
      
          // Get total recycling quantity (All-time total)
          const total = await this.recyclingLogRepository
            .createQueryBuilder('recycling_log')
            .select('SUM(recycling_log.quantity)', 'total')
            .where('recycling_log.user = :user', { user: user.id })
            .getRawOne();
      
          // Get total for the current month up to today
          const currentMonth = await this.recyclingLogRepository
            .createQueryBuilder('recycling_log')
            .select('SUM(recycling_log.quantity)', 'total')
            .where('recycling_log.timestamp BETWEEN :startDate AND :endDate', {
              startDate: startOfCurrentMonth,
              endDate: today,
            })
            .andWhere('recycling_log.user = :user', { user: user.id })
            .getRawOne();
      
          // Get total for the same range in the previous month
          const previousMonth = await this.recyclingLogRepository
            .createQueryBuilder('recycling_log')
            .select('SUM(recycling_log.quantity)', 'total')
            .where('recycling_log.timestamp BETWEEN :startDate AND :endDate', {
              startDate: startOfPreviousMonth,
              endDate: endOfPreviousMonth,
            })
            .andWhere('recycling_log.user = :user', { user: user.id })
            .getRawOne();
      
          console.log("Total:", total);
          console.log("Current Month:", currentMonth);
          console.log("Previous Month:", previousMonth);
      
          const current = parseFloat(currentMonth?.total || '0');
          const previous = parseFloat(previousMonth?.total || '0');
      
          let percentageChange = 0;
      
          if (previous === 0 && current > 0) {
            percentageChange = 100; // If previous was 0 and current is positive, assume 100% increase
          } else if (previous === 0 && current === 0) {
            percentageChange = 0; // If both previous and current are zero, no change
          } else if (previous > 0) {
            percentageChange = ((current - previous) / previous) * 100; // Normal percentage change calculation
          }
      
          return {
            total: parseInt(total?.total || '0', 10),
            percentageChange: parseFloat(percentageChange.toFixed(2)),
          };
        }
      
  


// little help from chat gpt
  async getCO2SavedPerWeek(userInfo): Promise<{ week: string; co2Saved: number }[]> {
    const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });

    if (user.role !== 'Citizen') {
      throw new HttpException('Only citizens can view their contributions', HttpStatus.FORBIDDEN);
    }
    const contributions = await this.recyclingLogRepository
      .createQueryBuilder('recyclingLog')
      .select("TO_CHAR(recyclingLog.timestamp, 'IYYY-IW')", 'week')
      .addSelect('SUM(recyclingLog.quantity)', 'totalQuantity')
      .addSelect("recyclingLog.material_type", 'materialType')
      .where('recyclingLog.user = :user', { user: user.id })
      .groupBy("TO_CHAR(recyclingLog.timestamp, 'IYYY-IW')")
      .addGroupBy('recyclingLog.material_type')
      .orderBy('week', 'ASC')
      .getRawMany();
  
    console.log('Contributions:', contributions);
  
    const weeklyCO2 = contributions.reduce((acc, record) => {
      const week = record.week || 'Unknown Week';
      const materialType = record.materialType || 'Unknown Material';
      const quantity = parseFloat(record.totalQuantity) || 0;
  
      const co2Factor = this.getCO2Factor(materialType);
      const co2Saved = quantity * co2Factor;
  
      console.log('Material Type:', materialType, 'Quantity:', quantity, 'CO2 Factor:', co2Factor);
  
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
      plastic: 1.5,
      metal: 2.2,
      glass: 0.9,
      paper: 1.2,
    };
    return factors[materialType.trim().toLowerCase()] || 0;
  }
  



  async findAll(): Promise<any[]> {
    const centers = await this.recyclingCenterRepository.find();
    const centersWithCoordinates = await Promise.all(centers.map(async center => {
      const { latitude, longitude } = await this.getCoordinates(center.address);
      return {
        center_name: center.name,
        location: center.address,
        contact_number: center.contact_number,
        Note: center.note,
        latitude,
        longitude,
        link_to_place_marked: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`,
      };
    }));
    return centersWithCoordinates;
  }
  
  async getCoordinates(location: string): Promise<{ latitude: number, longitude: number }> {
    const apiKey = 'AlzaSyPEAghxtvqdD50dEH6VvMlQI8zs_grT0Oh';
    try {
      const response = await axios.get(`https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${encodeURIComponent(location)}&key=${apiKey}`);
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw new Error('Could not fetch coordinates');
    }
  }
}



  




