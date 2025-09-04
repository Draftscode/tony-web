import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "../auth/auth.module";
import { BlaudirektController } from "./blaudirekt.controller";
import { BlaudirektService } from "./blaudirekt.service";

@Module({
    imports: [AuthModule, ScheduleModule, HttpModule],
    providers: [BlaudirektService],
    controllers: [BlaudirektController]
})
export class BlaudirektModule { }