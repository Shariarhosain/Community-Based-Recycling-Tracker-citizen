"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recycling_log_entity_1 = require("./Entitys/recycling-log.entity");
const user_entity_1 = require("./Entitys/user.entity");
const recycling_center_entity_1 = require("./Entitys/recycling-center.entity");
const mailer_service_1 = require("../mailer/mailer.service");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
let CitizenService = class CitizenService {
    constructor(recyclingLogRepository, userRepository, recyclingCenterRepository, MailerService) {
        this.recyclingLogRepository = recyclingLogRepository;
        this.userRepository = userRepository;
        this.recyclingCenterRepository = recyclingCenterRepository;
        this.MailerService = MailerService;
    }
    calculateRewardPoints(quantity) {
        const pointsPerKg = 10;
        return quantity * pointsPerKg;
    }
    async addContribution(createContributionDto, user) {
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can contribute', common_1.HttpStatus.FORBIDDEN);
        }
        const use = await this.userRepository.findOne({ where: { email: user.email } });
        if (!use) {
            throw new common_1.NotFoundException(`User with name ${name} not found`);
        }
        const recyclingCenter = await this.recyclingCenterRepository.findOne({ where: { name: createContributionDto.recyclingCenterName } });
        if (!recyclingCenter) {
            throw new common_1.NotFoundException(`Recycling center with name ${createContributionDto.recyclingCenterName} not found`);
        }
        const acceptedMaterials = recyclingCenter.material_types_accepted.split(',').map(material => material.trim().toLowerCase());
        if (!acceptedMaterials.includes(createContributionDto.material_type.toLowerCase())) {
            throw new common_1.BadRequestException(`Material type "${createContributionDto.material_type}" is not accepted by the recycling center "${recyclingCenter.name}". Accepted materials are: ${acceptedMaterials.join(', ')}`);
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
    async uploadImage(image) {
        if (!image || !image.buffer) {
            throw new Error('No valid image buffer available');
        }
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        const imageName = image.originalname;
        const filePath = path.join(uploadPath, imageName);
        fs.writeFileSync(filePath, image.buffer);
        console.log(`Image saved with original name: ${imageName}`);
    }
    async findAll2(userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const contributions = await this.recyclingLogRepository
            .createQueryBuilder('recyclingLog')
            .innerJoin('recyclingLog.recycling_center', 'recyclingCenter')
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
            'recyclingCenter.name',
        ])
            .getMany();
        if (!contributions) {
            throw new common_1.NotFoundException('No contributions found');
        }
        return contributions;
    }
    async getRecentContributions(userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 20);
        const contribution = await this.recyclingLogRepository
            .createQueryBuilder('recyclingLog')
            .innerJoin('recyclingLog.recycling_center', 'recyclingCenter')
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
            'recyclingCenter.name',
        ])
            .getMany();
        if (!contribution) {
            throw new common_1.NotFoundException('No contributions found');
        }
        return contribution;
    }
    async getContributionsByDate(startDate, endDate, userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const ContributionsByDate = await this.recyclingLogRepository
            .createQueryBuilder('recyclingLog')
            .where('recyclingLog.user = :user', { user: user.id })
            .andWhere('recyclingLog.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('recyclingLog.timestamp', 'DESC')
            .getMany();
        if (!ContributionsByDate) {
            throw new common_1.NotFoundException('No contributions found');
        }
        return ContributionsByDate;
    }
    async getContributionsByQuantity(quantity, userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const ContributionsByQuantity = await this.recyclingLogRepository
            .createQueryBuilder('recyclingLog')
            .where('recyclingLog.user = :user', { user: user.id })
            .andWhere('recyclingLog.quantity >= :quantity', { quantity })
            .orderBy('recyclingLog.quantity', 'DESC')
            .getMany();
        if (!ContributionsByQuantity) {
            throw new common_1.NotFoundException('No contributions found');
        }
        return ContributionsByQuantity;
    }
    async getContributionsByStatus(status, userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const ContributionsByStatus = await this.recyclingLogRepository
            .createQueryBuilder('recyclingLog')
            .where('recyclingLog.user = :user', { user: user.id })
            .andWhere('recyclingLog.status = :status', { status })
            .orderBy('recyclingLog.timestamp', 'DESC')
            .getMany();
        if (!ContributionsByStatus) {
            throw new common_1.NotFoundException('No contributions found');
        }
        return ContributionsByStatus;
    }
    getStartOfCurrentMonthToToday() {
        const start = new Date();
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date();
        end.setUTCHours(23, 59, 59, 999);
        return { start, end };
    }
    getStartOfPreviousMonth() {
        const date = new Date();
        date.setUTCMonth(date.getUTCMonth() - 1);
        date.setUTCDate(1);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }
    getEndOfPreviousMonthSameDay() {
        const today = new Date();
        const previousMonth = new Date();
        previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
        previousMonth.setUTCDate(today.getUTCDate());
        previousMonth.setUTCHours(23, 59, 59, 999);
        return previousMonth;
    }
    async getImpactDashboard(userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
        }
        const { start: startOfCurrentMonth, end: today } = this.getStartOfCurrentMonthToToday();
        const startOfPreviousMonth = this.getStartOfPreviousMonth();
        const endOfPreviousMonth = this.getEndOfPreviousMonthSameDay();
        console.log('Start of Current Month:', startOfCurrentMonth);
        console.log('End (Today’s Date):', today);
        console.log('Start of Previous Month:', startOfPreviousMonth);
        console.log('End of Previous Month (Matching Today’s Day):', endOfPreviousMonth);
        const total = await this.recyclingLogRepository
            .createQueryBuilder('recycling_log')
            .select('SUM(recycling_log.quantity)', 'total')
            .where('recycling_log.user = :user', { user: user.id })
            .getRawOne();
        const currentMonth = await this.recyclingLogRepository
            .createQueryBuilder('recycling_log')
            .select('SUM(recycling_log.quantity)', 'total')
            .where('recycling_log.timestamp BETWEEN :startDate AND :endDate', {
            startDate: startOfCurrentMonth,
            endDate: today,
        })
            .andWhere('recycling_log.user = :user', { user: user.id })
            .getRawOne();
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
            percentageChange = 100;
        }
        else if (previous === 0 && current === 0) {
            percentageChange = 0;
        }
        else if (previous > 0) {
            percentageChange = ((current - previous) / previous) * 100;
        }
        return {
            total: parseInt(total?.total || '0', 10),
            percentageChange: parseFloat(percentageChange.toFixed(2)),
        };
    }
    async getCO2SavedPerWeek(userInfo) {
        const user = await this.userRepository.findOne({ where: { email: userInfo.user.email } });
        if (user.role !== 'Citizen') {
            throw new common_1.HttpException('Only citizens can view their contributions', common_1.HttpStatus.FORBIDDEN);
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
        return Object.values(weeklyCO2).map((item) => ({
            week: item.week,
            co2Saved: parseFloat(item.co2Saved.toFixed(2)),
        }));
    }
    getCO2Factor(materialType) {
        const factors = {
            plastic: 1.5,
            metal: 2.2,
            glass: 0.9,
            paper: 1.2,
        };
        return factors[materialType.trim().toLowerCase()] || 0;
    }
    async findAll() {
        const centers = await this.recyclingCenterRepository.find();
        const centersWithCoordinates = await Promise.all(centers.map(async (center) => {
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
    async getCoordinates(location) {
        const apiKey = 'AlzaSyPEAghxtvqdD50dEH6VvMlQI8zs_grT0Oh';
        try {
            const response = await axios_1.default.get(`https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${encodeURIComponent(location)}&key=${apiKey}`);
            const { lat, lng } = response.data.results[0].geometry.location;
            return { latitude: lat, longitude: lng };
        }
        catch (error) {
            console.error('Error fetching coordinates:', error);
            throw new Error('Could not fetch coordinates');
        }
    }
};
exports.CitizenService = CitizenService;
exports.CitizenService = CitizenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recycling_log_entity_1.RecyclingLog)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(recycling_center_entity_1.RecyclingCenter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_service_1.MailerService])
], CitizenService);
//# sourceMappingURL=citizen.service.js.map