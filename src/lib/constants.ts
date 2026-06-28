import type { CommunityPostType, ConsentScope, ContextType, ToneType } from "../types/app";

export const contextOptions: Array<{ value: ContextType; label: string }> = [
  { value: "general", label: "Chung" },
  { value: "personal_message", label: "Tin nhắn cá nhân" },
  { value: "school", label: "Trường học" },
  { value: "work", label: "Công việc" },
  { value: "family", label: "Gia đình" },
  { value: "travel", label: "Đi lại" },
  { value: "money", label: "Tiền bạc" },
  { value: "warning", label: "Cảnh báo" },
  { value: "community", label: "Cộng đồng" },
  { value: "other", label: "Khác" },
];

export const toneOptions: Array<{ value: ToneType; label: string }> = [
  { value: "polite", label: "Lịch sự" },
  { value: "neutral", label: "Trung lập" },
  { value: "friendly", label: "Thân thiện" },
  { value: "formal", label: "Trang trọng" },
  { value: "short", label: "Ngắn gọn" },
];

export const consentOptions: Array<{ value: ConsentScope; title: string; description: string }> = [
  { value: "public", title: "Công khai", description: "Hiển thị cho mọi người trên Hiểu Rõ." },
  { value: "anonymous", title: "Ẩn danh", description: "Hiển thị nhưng không gắn tên người đóng góp." },
  { value: "internal_only", title: "Chỉ dùng nội bộ", description: "Chỉ dùng để cải thiện hệ thống, không hiển thị công khai." },
];

export const communityTabs: Array<{ value: "all" | CommunityPostType; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "ask_meaning", label: "Hỏi nghĩa" },
  { value: "share_sample", label: "Chia sẻ" },
  { value: "feedback", label: "Góp ý" },
];

export const communityTypeLabels: Record<CommunityPostType, string> = {
  ask_meaning: "Hỏi nghĩa",
  share_sample: "Chia sẻ",
  feedback: "Góp ý",
  discussion: "Thảo luận",
};

export const learningTypeLabels = {
  clarity: "Rõ ý",
  grammar: "Cấu trúc câu",
  word_order: "Thứ tự ý",
  connector: "Từ nối",
  time_specificity: "Thời gian cụ thể",
  politeness: "Lịch sự",
  sentence_pattern: "Mẫu câu",
} as const;
