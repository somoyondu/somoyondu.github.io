import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../enums';

export const AUDIT_KEY = 'audit';
export interface AuditMeta {
  entity: string;
  action: AuditAction;
}
export const Audit = (entity: string, action: AuditAction) =>
  SetMetadata(AUDIT_KEY, { entity, action } as AuditMeta);
