// recycling-log.controller.ts
import { Controller, Post, Body,Get, Query } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { AddContributionDto } from './dto/add-contribution.dto';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';

@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}


  @Post('contribute')
  async addContribution(
    @Body() createContributionDto: AddContributionDto, 
  ): Promise<RecyclingLog> {
    return await this.citizenService.addContribution(createContributionDto);
  }

  @Get('recent-contributions')
    async getRecentContributions(): Promise<RecyclingLog[]> {
        return await this.citizenService.getRecentContributions();
    }


  @Get('by-date')
  async getContributionsByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<RecyclingLog[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.citizenService.getContributionsByDate(start, end);
  }

  @Get('by-quantity')
  async getContributionsByQuantity(
    @Query('quantity') quantity: number,
  ): Promise<RecyclingLog[]> {
    return this.citizenService.getContributionsByQuantity(quantity);
  }


  @Get('by-status')
  async getContributionsByStatus(
    @Query('status') status: string,
  ): Promise<RecyclingLog[]> {
    return this.citizenService.getContributionsByStatus(status);
  }




@Get('total-recycling')
async getImpactDashboard(): Promise<{ total: number; percentageChange: number }> {
  return this.citizenService.getImpactDashboard();
}

@Get('co2-saved-per-week')
async getCO2SavedPerWeek(): Promise<{ week: string; co2Saved: number }[]> {
  return this.citizenService.getCO2SavedPerWeek();
}










@Get('search-center')
async getCenterByName(@Query('name') centerName: string): Promise<RecyclingCenter> {
  return this.citizenService.getCenterByName(centerName);
}
}











