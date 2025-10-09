import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { BlaudirektController } from "./blaudirekt.controller";
import { BlaudirektService } from "./blaudirekt.service";

@Module({
    imports: [ScheduleModule, HttpModule],
    providers: [BlaudirektService],
    controllers: [BlaudirektController]
})
export class BlaudirektModule { }