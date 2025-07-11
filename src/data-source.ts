import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Pet } from './pets/pets.entity';
import { Match } from './match/match.entity';
import { SitterSpec } from './sitter-spec/sitter-spec.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,
  logging: true,
  entities: [User, Pet, Match, SitterSpec],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
