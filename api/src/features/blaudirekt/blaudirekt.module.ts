import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { BlaudirektController } from "./blaudirekt.controller";
import { BlaudirektService } from "./blaudirekt.service";
import { FilesModule } from "../files/files.module";
import { FcmModule } from "../fcm/fcm.module";

@Module({
    imports: [ScheduleModule, HttpModule, FilesModule, FcmModule],
    providers: [BlaudirektService],
    controllers: [BlaudirektController]
})
export class BlaudirektModule { }