import { ProfileService } from './profile.service';
import { ProfileAdminService } from './profileAdmin.service';

export const services = [ProfileService, ProfileAdminService];

export * from './profile.service';
export * from './profileAdmin.service';
