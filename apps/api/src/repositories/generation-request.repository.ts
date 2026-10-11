import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";

export interface CreateGenerationRequestData {
  teacherId: string;
  contentType: string;
  resourceId?: string | null;
  provider: string;
  model: string;
  promptVersion: string;
  status: string;
  inputContext: Prisma.InputJsonValue;
}

export interface UpdateGenerationRequestData {
  status?: string;
  resourceId?: string | null;
  outputMetadata?: Prisma.InputJsonValue;
  errorCode?: string | null;
  errorMessage?: string | null;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  completedAt?: Date;
}

export class GenerationRequestRepository {
  static async create(data: CreateGenerationRequestData) {
    return prisma.generationRequest.create({
      data: {
        teacherId: data.teacherId,
        contentType: data.contentType,
        resourceId: data.resourceId || null,
        provider: data.provider,
        model: data.model,
        promptVersion: data.promptVersion,
        status: data.status,
        inputContext: data.inputContext,
      },
    });
  }

  static async update(id: string, data: UpdateGenerationRequestData) {
    return prisma.generationRequest.update({
      where: { id },
      data,
    });
  }

  static async findById(id: string) {
    return prisma.generationRequest.findUnique({
      where: { id },
    });
  }
}
