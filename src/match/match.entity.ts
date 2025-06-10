import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../pets/pets.entity';
import { User } from '../user/user.entity';

export enum MatchStatus {
  PENDING = 'PENDING',   // Request sent, waiting for approval
  APPROVED = 'APPROVED', // Request accepted
  REJECTED = 'REJECTED', // Request rejected
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The user who initiated the match request
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // The user who received the match request
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  // The requester's pet for breeding
  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_pet_id' })
  requesterPet: Pet;

  // The recipient's pet for breeding
  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_pet_id' })
  recipientPet: Pet;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING
  })
  status: MatchStatus;
  
  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}