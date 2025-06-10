import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column('int')
  age: number;

  @Column({
    type: 'enum',
    enum: PetGender,
  })
  gender: PetGender;

  @Column({ default: false })
  vaccinated: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true })
  image: string[];

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner: User;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isAvailableForMatch: boolean;

  @Column({ default: false })
  isAvailableForBoarding: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
