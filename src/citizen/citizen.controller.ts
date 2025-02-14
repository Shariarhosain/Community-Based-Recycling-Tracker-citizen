// recycling-log.controller.ts
import { Controller, Post, Body,Get, Query, UseGuards, ValidationPipe, UsePipes, Param, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { AddContributionDto } from './dto/add-contribution.dto';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';
import { JwtAuthGuard } from 'src/jwt.strategy/jwt-auth.guard';
import { pipe } from 'rxjs';
import { userInfo } from 'os';
import { FileInterceptor } from '@nestjs/platform-express';

import * as multer from 'multer'; // Import multer
import { promises } from 'dns';
import { User } from './Entitys/user.entity';

@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('contribute')
  async addContribution(@Req() userInfo, @Body() createContributionDto: AddContributionDto): Promise<RecyclingLog> {
    return await this.citizenService.addContribution(createContributionDto, userInfo.user);
  }
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),  // Store file in memory
    }),
  )
  async uploadImage(
    @UploadedFile() image: Express.Multer.File, // Ensure you are using the correct decorator
  ) {
    if (!image) {
      throw new Error('No image file uploaded');
    }

  

    // Call the service to save the image
    await this.citizenService.uploadImage(image);

    return { message: 'Image uploaded successfully', image };
  }
 @UseGuards(JwtAuthGuard)
  @Get('recent-contributions')
    async getRecentContributions(@Req() userInfo:any): Promise<RecyclingLog[]> {
        return await this.citizenService.getRecentContributions(userInfo);
    }

  @UseGuards(JwtAuthGuard)
  @Post('by-date')
  async getContributionsByDate(@Req() userInfo,@Body() getContributionsByDate): Promise<RecyclingLog[]> {
    const start = new Date(getContributionsByDate.startDate);
    const end = new Date(getContributionsByDate.endDate);
    return this.citizenService.getContributionsByDate(start,end,userInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('show-all')
  async showAllContributions(@Req() userInfo): Promise<RecyclingLog[]> {
    return this.citizenService.findAll2(userInfo);
  }

  @Get('check-auth')
  @UseGuards(JwtAuthGuard) // ✅ Protect with JWT authentication
  async checkAuth(@Req() req) {
    return {
      message: "You are authenticated",
      user: req.user,
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('by-quantity')
  async getContributionsByQuantity(@Req() userInfo,@Body() quantity: number,): Promise<RecyclingLog[]> {
    return this.citizenService.getContributionsByQuantity(quantity,userInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('by-status')
  async getContributionsByStatus(@Req() userInfo,@Body() status: string): Promise<RecyclingLog[]> {
    return this.citizenService.getContributionsByStatus(status,userInfo);
  }




  

  @UseGuards(JwtAuthGuard)
@Get('total-recycling')
async getImpactDashboard(@Req() userInfo): Promise<{ total: number; percentageChange: number }> {
  return this.citizenService.getImpactDashboard(userInfo);
}
@UseGuards(JwtAuthGuard)
@Get('co2-saved-per-week')
async getCO2SavedPerWeek(@Req() userInfo): Promise<{ week: string; co2Saved: number }[]> {
  return this.citizenService.getCO2SavedPerWeek(userInfo);
}








@UseGuards(JwtAuthGuard)
@Get('search-center')
async showAll() {
  return this.citizenService.findAll();
}
}













