import { Household, PrivacyLevel } from '@controle-financeiro/domain';
import { HouseholdRepository } from '../../ports/HouseholdRepository';
import { DomainError } from '../../errors/DomainError';

export interface CreateHouseholdDto {
  name: string;
  currency?: string;
  privacyLevel?: PrivacyLevel;
}

export class CreateHousehold {
  constructor(private readonly householdRepository: HouseholdRepository) {}

  async execute(dto: CreateHouseholdDto): Promise<Household> {
    // Validar dados de entrada
    this.validateInput(dto);

    // Verificar se já existe um household com o mesmo nome
    const existingHousehold = await this.householdRepository.findByName(dto.name);
    if (existingHousehold) {
      throw new DomainError('A household with this name already exists');
    }

    // Criar o household
    const household = new Household(dto.name, {
      currency: dto.currency || 'BRL',
      privacyLevel: dto.privacyLevel || PrivacyLevel.PRIVATE,
    });

    // Salvar no repositório
    await this.householdRepository.save(household);

    return household;
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
