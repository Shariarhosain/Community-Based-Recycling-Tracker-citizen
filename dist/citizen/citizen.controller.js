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
let CitizenController = class CitizenController {
    constructor(citizenService) {
        this.citizenService = citizenService;
    }
    async addContribution(createContributionDto) {
        return await this.citizenService.addContribution(createContributionDto);
    }
    async getRecentContributions() {
        return await this.citizenService.getRecentContributions();
    }
    async getContributionsByDate(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.citizenService.getContributionsByDate(start, end);
    }
    async getContributionsByQuantity(quantity) {
        return this.citizenService.getContributionsByQuantity(quantity);
    }
    async getContributionsByStatus(status) {
        return this.citizenService.getContributionsByStatus(status);
    }
    async getImpactDashboard() {
        return this.citizenService.getImpactDashboard();
    }
    async getCO2SavedPerWeek() {
        return this.citizenService.getCO2SavedPerWeek();
    }
    async getCenterByName(centerName) {
        return this.citizenService.getCenterByName(centerName);
    }
};
exports.CitizenController = CitizenController;
__decorate([
    (0, common_1.Post)('contribute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_contribution_dto_1.AddContributionDto]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "addContribution", null);
__decorate([
    (0, common_1.Get)('recent-contributions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getRecentContributions", null);
__decorate([
    (0, common_1.Get)('by-date'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByDate", null);
__decorate([
    (0, common_1.Get)('by-quantity'),
    __param(0, (0, common_1.Query)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByQuantity", null);
__decorate([
    (0, common_1.Get)('by-status'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getContributionsByStatus", null);
__decorate([
    (0, common_1.Get)('total-recycling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getImpactDashboard", null);
__decorate([
    (0, common_1.Get)('co2-saved-per-week'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getCO2SavedPerWeek", null);
__decorate([
    (0, common_1.Get)('search-center'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CitizenController.prototype, "getCenterByName", null);
exports.CitizenController = CitizenController = __decorate([
    (0, common_1.Controller)('citizen'),
    __metadata("design:paramtypes", [citizen_service_1.CitizenService])
], CitizenController);
//# sourceMappingURL=citizen.controller.js.map