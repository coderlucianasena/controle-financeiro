import { Household } from '@controle-financeiro/domain';

export interface HouseholdRepository {
  save(household: Household): Promise<void>;
  findById(id: string): Promise<Household | null>;
  findByName(name: string): Promise<Household | null>;
  findAll(): Promise<Household[]>;
  delete(id: string): Promise<void>;
}
