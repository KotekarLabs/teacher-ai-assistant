import { z } from "zod";

export const ContentTypeEnum = z.enum([
  "LESSON",
  "WORKSHEET",
  "QUIZ",
  "HOMEWORK",
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

export const ContentStatusEnum = z.enum([
  "DRAFT",
  "EDITED",
  "SAVED",
  "ARCHIVED",
]);
export type ContentStatus = z.infer<typeof ContentStatusEnum>;

export const ContentDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type ContentDifficulty = z.infer<typeof ContentDifficultyEnum>;

export const ContentSortEnum = z.enum([
  "updatedAt_desc",
  "updatedAt_asc",
  "title_asc",
  "title_desc",
]);
export type ContentSort = z.infer<typeof ContentSortEnum>;

export const GetContentQuerySchema = z.object({
  search: z.string().optional(),
  type: z
    .enum(["ALL", "LESSON", "WORKSHEET", "QUIZ", "HOMEWORK"])
    .optional()
    .default("ALL"),
  classId: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  status: z
    .enum(["ALL", "DRAFT", "EDITED", "SAVED", "ARCHIVED", "ACTIVE"])
    .optional(),
  sort: ContentSortEnum.optional().default("updatedAt_desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type GetContentQuery = z.infer<typeof GetContentQuerySchema>;

export interface ContentClassSummary {
  id: string;
  name: string;
}

export interface ContentDTO {
  id: string;
  type: ContentType;
  resourceId: string;
  title: string;
  subject: string;
  topic: string;
  difficulty?: string | null;
  status: string;
  classId?: string | null;
  class?: ContentClassSummary | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface ContentPaginationDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ContentListResponse {
  items: ContentDTO[];
  pagination: ContentPaginationDTO;
}

export interface ContentResponse {
  content: ContentDTO;
  message?: string;
}
