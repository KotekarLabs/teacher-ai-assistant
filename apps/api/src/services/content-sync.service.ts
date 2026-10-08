import { Prisma, PrismaClient } from "@prisma/client";
import {
  ContentRepository,
  type UpsertContentData,
} from "../repositories/content.repository";

export class ContentSyncService {
  static async syncResource(
    payload: UpsertContentData,
    db?: Prisma.TransactionClient | PrismaClient,
  ) {
    return ContentRepository.upsert(payload, db);
  }
}
