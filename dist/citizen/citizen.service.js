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
let CitizenService = class CitizenService {
    constructor(recyclingLogRepository, userRepository, recyclingCenterRepository) {
        this.recyclingLogRepository = recyclingLogRepository;
        this.userRepository = userRepository;
        this.recyclingCenterRepository = recyclingCenterRepository;
    }
    calculateRewardPoints(quantity) {
        const pointsPerKg = 10;
        return quantity * pointsPerKg;
    }
    async addContribution(createContributionDto) {
        const user = await this.userRepository.findOne({ where: { name: createContributionDto.userName } });
        if (!user) {
            throw new common_1.NotFoundException(`User with name ${createContributionDto.userName} not found`);
        }
        const recyclingCenter = await this.recyclingCenterRepository.findOne({ where: { name: createContributionDto.recyclingCenterName } });
        if (!recyclingCenter) {
            throw new common_1.NotFoundException(`Recycling center with name ${createContributionDto.recyclingCenterName} not found`);
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
    async getRecentContributions() {
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 15);
        return this.recyclingLogRepository.find({
            where: {
                timestamp: (0, typeorm_2.Between)(pastDate, currentDate),
            },
        });
    }
    async getContributionsByDate(startDate, endDate) {
        return this.recyclingLogRepository.find({
            where: {
                timestamp: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    async getContributionsByQuantity(quantity) {
        return this.recyclingLogRepository.find({
            where: {
                quantity: quantity,
            },
        });
    }
    async getContributionsByStatus(status) {
        return this.recyclingLogRepository.find({
            where: {
                status: status,
            },
        });
    }
    getStartOfCurrentWeek() {
        const date = new Date();
        const dayOfWeek = date.getDay();
        date.setDate(date.getDate() - dayOfWeek);
        return date;
    }
    getStartOfPreviousWeek() {
        const date = this.getStartOfCurrentWeek();
        date.setDate(date.getDate() - 7);
        return date;
    }
    getEndOfPreviousWeek() {
        const date = this.getStartOfCurrentWeek();
        date.setDate(date.getDate() - 1);
        return date;
    }
    async getImpactDashboard() {
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
        }
        else if (previous > 0) {
            percentageChange = ((current - previous) / previous) * 100;
        }
        return {
            total: parseInt(total?.total || '0', 10),
            percentageChange: parseFloat(percentageChange.toFixed(2)),
        };
    }
    async getCO2SavedPerWeek() {
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
        return Object.values(weeklyCO2).map((item) => ({
            week: item.week,
            co2Saved: parseFloat(item.co2Saved.toFixed(2)),
        }));
    }
    getCO2Factor(materialType) {
        const factors = {
            Plastic: 1.5,
            Metal: 2.2,
            Glass: 0.9,
            Paper: 1.2,
        };
        return factors[materialType] || 0;
    }
    async getCenterByName(centerName) {
        const center = await this.recyclingCenterRepository.findOne({
            where: { name: centerName },
        });
        if (!center) {
            throw new common_1.NotFoundException(`Recycling center with name '${centerName}' not found`);
        }
        return center;
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
        typeorm_2.Repository])
], CitizenService);
//# sourceMappingURL=citizen.service.js.map