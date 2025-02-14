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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecyclingLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const recycling_center_entity_1 = require("./recycling-center.entity");
let RecyclingLog = class RecyclingLog {
};
exports.RecyclingLog = RecyclingLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecyclingLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user' }),
    __metadata("design:type", user_entity_1.User)
], RecyclingLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => recycling_center_entity_1.RecyclingCenter),
    (0, typeorm_1.JoinColumn)({ name: 'recycling_center' }),
    __metadata("design:type", recycling_center_entity_1.RecyclingCenter)
], RecyclingLog.prototype, "recycling_center", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], RecyclingLog.prototype, "material_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], RecyclingLog.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'Pending' }),
    __metadata("design:type", String)
], RecyclingLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RecyclingLog.prototype, "reward_points", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RecyclingLog.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], RecyclingLog.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], RecyclingLog.prototype, "message", void 0);
exports.RecyclingLog = RecyclingLog = __decorate([
    (0, typeorm_1.Entity)()
], RecyclingLog);
//# sourceMappingURL=recycling-log.entity.js.map