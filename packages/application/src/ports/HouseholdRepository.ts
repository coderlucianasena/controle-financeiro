export interface HouseholdRepository {
  save(household: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByName(name: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  delete(id: string): Promise<void>;
}
