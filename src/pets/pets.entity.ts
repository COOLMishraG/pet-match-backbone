import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum AnimalType {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  FISH = 'FISH',
  REPTILE = 'REPTILE',
  OTHER = 'OTHER',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AnimalType,
  })
  animal: AnimalType;

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

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

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
