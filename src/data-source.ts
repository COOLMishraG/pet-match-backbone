import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Pet } from './pets/pets.entity';
import { Match } from './match/match.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'tinder_core',
  synchronize: false,
  logging: true,
  entities: [User, Pet, Match],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
