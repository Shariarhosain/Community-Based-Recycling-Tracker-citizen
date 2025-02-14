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
exports.CitizenController = void 0;
const common_1 = require("@nestjs/common");
const citizen_service_1 = require("./citizen.service");
const add_contribution_dto_1 = require("./dto/add-contribution.dto");
const jwt_auth_guard_1 = require("../jwt.strategy/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
let CitizenController = class CitizenController {
    constructor(citizenService) {
        this.citizenService = citizenService;
    }
    async addContribution(userInfo, createContributionDto) {
        return await this.citizenService.addContribution(createContributionDto, userInfo.user);
    }
    async uploadImage(image) {
        if (!image) {
            throw new Error('No image file uploaded');
        }
        await this.citizenService.uploadImage(image);
        return { message: 'Image uploaded successfully', image };
    }
    async getRecentContributions(userInfo) {
        return await this.citizenService.getRecentContributions(userInfo);
    }
    async getContributionsByDate(userInfo, getContributionsByDate) {
        const start = new Date(getContributionsByDate.startDate);
        const end = new Date(getContributionsByDate.endDate);
        return this.citizenService.getContributionsByDate(start, end, userInfo);
    }
    async showAllContributions(userInfo) {
        return this.citizenService.findAll2(userInfo);
    }
    async checkAuth(req) {
        return {
            message: "You are authenticated",
            user: req.user,
        };
    }
    async getContributionsByQuantity(userInfo, quantity) {
        return this.citizenService.getContributionsByQuantity(quantity, userInfo);
    }
    async getContributionsByStatus(userInfo, status) {
        return this.citizenService.getContributionsByStatus(status, userInfo);
    }
    async getImpactDashboard(userInfo) {
        return this.citizenService.getImpactDashboard(userInfo);
    }
    async getCO2SavedPerWeek(userInfo) {
        return this.citizenService.getCO2SavedPerWeek(userInfo);
    }
    async showAll() {
        return this.citizenService.findAll();
    }
};
exports.CitizenController = CitizenController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, common_1.Post)('contribute'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_contribution_dto_1.AddContributionDto]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "addContribution", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: multer.memoryStorage(),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('recent-contributions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getRecentContributions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('by-date'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByDate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('show-all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "showAllContributions", null);
__decorate([
    (0, common_1.Get)('check-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "checkAuth", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('by-quantity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByQuantity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('by-status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('total-recycling'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getImpactDashboard", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('co2-saved-per-week'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getCO2SavedPerWeek", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('search-center'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "showAll", null);
exports.CitizenController = CitizenController = __decorate([
    (0, common_1.Controller)('citizen'),
    __metadata("design:paramtypes", [citizen_service_1.CitizenService])
], CitizenController);
//# sourceMappingURL=citizen.controller.js.map