import { Module } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { CitizenController } from './citizen.controller';
import { RecyclingLog } from './Entitys/recycling-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entitys/user.entity';
import { RecyclingCenter } from './Entitys/recycling-center.entity';


@Module({
  imports: [TypeOrmModule.forFeature([RecyclingLog, User, RecyclingCenter])],
  providers: [CitizenService],
  controllers: [CitizenController],
})
export class CitizenModule {}
