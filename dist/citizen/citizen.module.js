"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenModule = void 0;
const common_1 = require("@nestjs/common");
const citizen_service_1 = require("./citizen.service");
const citizen_controller_1 = require("./citizen.controller");
const recycling_log_entity_1 = require("./Entitys/recycling-log.entity");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./Entitys/user.entity");
const recycling_center_entity_1 = require("./Entitys/recycling-center.entity");
const mailer_service_1 = require("../mailer/mailer.service");
const config_1 = require("@nestjs/config");
let CitizenModule = class CitizenModule {
};
exports.CitizenModule = CitizenModule;
exports.CitizenModule = CitizenModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([recycling_log_entity_1.RecyclingLog, user_entity_1.User, recycling_center_entity_1.RecyclingCenter]), config_1.ConfigModule],
        providers: [citizen_service_1.CitizenService, mailer_service_1.MailerService],
        controllers: [citizen_controller_1.CitizenController],
    })
], CitizenModule);
//# sourceMappingURL=citizen.module.js.map