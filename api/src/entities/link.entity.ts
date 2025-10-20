import { randomBytes } from 'crypto';
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { CustomerEntity } from './customer.entity';


@Entity()
export class LinkEntity<T = unknown> extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    link: string;

    @Column({ type: "json" })
    data: T;

    @Column()
    expirationTime: string;

    @ManyToOne(() => CustomerEntity, (customer) => customer.links, { nullable: true })
    @JoinColumn({ name: "customerId" })
    customer: Relation<CustomerEntity>;

    @Column({ nullable: true })
    customerId: number;

    @BeforeInsert()
    async generateLink() {
        // Generate new links until one is unique
        let unique = false;
        while (!unique) {
            const candidate = randomBytes(4).toString('hex');
            // Check for existing record
            const existing = await LinkEntity.findOneBy({ link: candidate });
            if (!existing) {
                this.link = candidate;
                unique = true;
            }
        }
    }

    @BeforeInsert()
    setExpirationTime() {
        const now = new Date();
        now.setDate(now.getDate() + 1); // adds 1 day
        this.expirationTime = now.toISOString();
    }
}