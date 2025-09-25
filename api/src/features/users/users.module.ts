import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [UsersController],
    exports: [UsersService],
    providers: [UsersService],
})
export class UserModule { }