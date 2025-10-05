import { DomainError } from '../../errors/DomainError';

export interface CreateHouseholdDto {
  name: string;
  currency?: string;
  privacyLevel?: string;
}

export class CreateHousehold {
  async execute(dto: CreateHouseholdDto): Promise<any> {
    // Validar dados de entrada
    this.validateInput(dto);

    // TODO: Implementar lógica de criação do household
    return {
      id: 'mock-id',
      name: dto.name,
      currency: dto.currency || 'BRL',
      privacyLevel: dto.privacyLevel || 'PRIVATE',
    };
  }

  private validateInput(dto: CreateHouseholdDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new DomainError('Household name is required');
    }

    if (dto.name.length > 100) {
      throw new DomainError('Household name must be less than 100 characters');
    }

    if (dto.currency && dto.currency.length !== 3) {
      throw new DomainError('Currency must be a 3-letter code (ISO 4217)');
    }
  }
}
