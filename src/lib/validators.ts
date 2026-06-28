import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email chưa đúng định dạng."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const registerSchema = z.object({
  email: z.string().email("Email chưa đúng định dạng."),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
  displayName: z.string().max(80, "Tên hiển thị quá dài.").optional(),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp.",
    path: ["confirmPassword"],
  });

export const rewriteSchema = z.object({
  input_text: z
    .string()
    .min(2, "Vui lòng nhập câu cần viết lại.")
    .max(3000, "Nội dung quá dài. Vui lòng rút gọn dưới 3000 ký tự."),
  context_type: z.string(),
  tone: z.string(),
});

export const sampleSchema = z.object({
  original_text: z.string().min(2, "Vui lòng nhập câu gốc.").max(3000),
  context_note: z.string().max(1000).optional(),
  intended_meaning: z.string().max(1000).optional(),
  standard_vietnamese_text: z.string().min(2, "Vui lòng nhập bản diễn đạt rõ hơn.").max(3000),
  consent_scope: z.enum(["public", "anonymous", "internal_only"]),
});

export const communityPostSchema = z.object({
  post_type: z.enum(["ask_meaning", "share_sample", "feedback", "discussion"]),
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự.").max(120, "Tiêu đề quá dài."),
  body: z.string().min(3, "Nội dung cần ít nhất 3 ký tự.").max(3000, "Nội dung quá dài."),
  is_anonymous: z.boolean().default(false),
});

export const communityReplySchema = z.object({
  body: z.string().min(2, "Vui lòng nhập phản hồi.").max(3000, "Phản hồi quá dài."),
  is_anonymous: z.boolean().default(false),
});
