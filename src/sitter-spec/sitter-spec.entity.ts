import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('sitter_spec')
export class SitterSpec {
    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @Column({ nullable: false})
    userName: string;

    @Column({ nullable: true })
    price: number;

    @Column({ nullable: true })
    rating: number;

    @Column({ nullable: true })
    available: boolean;

    @Column({ nullable: true })
    description: string;

    @Column('text', { array: true, nullable: true })
    specialties: string[];

    @Column({default:0})
    petSatCount: number;

    @Column({ default: 0 })
    experience: number;

    @Column({ nullable: true })
    responseTime: string;
}