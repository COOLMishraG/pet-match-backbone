export class CreateSitterSpecDto {
  userName: string;
  price?: number;
  rating?: number;
  available?: boolean;
  description?: string;
  specialties?: string[];
  petSatCount?: number;
  experience?: number;
  responseTime?: string;
}

export class UpdateSitterSpecDto {
  price?: number;
  rating?: number;
  available?: boolean;
  description?: string;
  specialties?: string[];
  petSatCount?: number;
  experience?: number;
  responseTime?: string;
}
