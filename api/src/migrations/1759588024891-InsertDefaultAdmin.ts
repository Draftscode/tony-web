import { RoleEntity } from "src/entities/roles.entity";
import { UserEntity } from "src/entities/user.entity";
import { encodePassword } from "src/features/auth/auth.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultAdmin1759588024891 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use the entity manager
        const userRepository = queryRunner.manager.getRepository(UserEntity);
        const roleRepository = queryRunner.manager.getRepository(RoleEntity);

        // Check if admin already exists
        const adminExists = await userRepository.findOne({
            where: { username: 'admin' },
        });

        if (adminExists) return; // admin already exists, skip

        // Check if roles exist, otherwise create them
        let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = roleRepository.create({ name: 'admin' });
            await roleRepository.save(adminRole);
        }

        // Create default admin
        const adminUser = userRepository.create({
            username: 'admin',
            password: encodePassword('tonym'),
            roles: [adminRole],
        });

        await userRepository.save(adminUser);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
