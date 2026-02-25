export interface Registry {
  id: string;
  municipalityId: string;
  type: RegistryType;
  data: Record<string, unknown>;
  documents: string[];
  status: RegistryStatus;
  hash: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
  validatedAt?: Date;
  validatedBy?: string;
  observations?: string;
}

export enum RegistryType {
  ACTIVITY = 'activity',
  EXPENSE = 'expense',
  CONTRACT = 'contract',
  PROJECT = 'project',
}

export enum RegistryStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  ON_CHAIN = 'on_chain',
}

export interface Municipality {
  id: string;
  name: string;
  address: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Validator {
  id: string;
  address: string;
  name: string;
  createdAt: Date;
}

export interface Validation {
  id: string;
  registryId: string;
  validatorId: string;
  action: 'approve' | 'reject';
  observations?: string;
  createdAt: Date;
}
