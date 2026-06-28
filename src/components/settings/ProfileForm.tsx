import { useState } from "react";
import type { Profile } from "../../types/app";
import { Button } from "../common/Button";

export function ProfileForm({ profile, onSave, saving }: { profile: Profile; onSave: (input: Partial<Profile>) => Promise<void>; saving?: boolean }) {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [isDeafCommunityMember, setIsDeafCommunityMember] = useState(profile.is_deaf_community_member);
  const [knowsSignLanguage, setKnowsSignLanguage] = useState(profile.knows_sign_language);

  return (
    <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-lg font-semibold text-app-text">Tài khoản</h2>
      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Tên hiển thị</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Họ tên</span>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-app-secondary">
          <input type="checkbox" className="mt-1" checked={isDeafCommunityMember} onChange={(event) => setIsDeafCommunityMember(event.target.checked)} />
          Tôi là thành viên cộng đồng người điếc hoặc đang hỗ trợ cộng đồng.
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-app-secondary">
          <input type="checkbox" className="mt-1" checked={knowsSignLanguage} onChange={(event) => setKnowsSignLanguage(event.target.checked)} />
          Tôi biết hoặc đang học ngôn ngữ ký hiệu.
        </label>
        <Button type="button" onClick={() => onSave({ display_name: displayName, full_name: fullName, is_deaf_community_member: isDeafCommunityMember, knows_sign_language: knowsSignLanguage })} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </section>
  );
}
