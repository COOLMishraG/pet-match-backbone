import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  OWNER = 'OWNER',
  SITTER = 'SITTER',
  VET = 'VET',
  SHELTER = 'SHELTER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() // Add this field to match your database schema
  name: string;

  @Column({ unique: true }) // Back to required after fixing null values
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // Make password nullable for OAuth users
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OWNER
  })
  role: UserRole;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  googleId: string;

  @Column('text', { array: true, nullable: true, default: '{}' })
  notifications: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}