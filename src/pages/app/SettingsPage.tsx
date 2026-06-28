import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { ProfileForm } from "../../components/settings/ProfileForm";
import { PrivacySettings } from "../../components/settings/PrivacySettings";
import { useAuth } from "../../auth/useAuth";
import { getCurrentProfile, getUserSettings, updateProfile, updateUserSettings } from "../../services/profileService";
import type { Profile, UserSettings } from "../../types/app";

export function SettingsPage() {
  const { signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const profileQuery = useQuery({ queryKey: ["current-profile"], queryFn: getCurrentProfile });
  const settingsQuery = useQuery({ queryKey: ["user-settings"], queryFn: getUserSettings });

  async function handleProfileSave(input: Partial<Profile>) {
    setSavingProfile(true);
    setMessage(null);
    try {
      await updateProfile(input);
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      setMessage("Đã lưu thông tin tài khoản.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSettingsSave(input: Partial<UserSettings>) {
    setSavingSettings(true);
    setMessage(null);
    try {
      await updateUserSettings(input);
      await queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      setMessage("Đã lưu cài đặt.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/auth/login", { replace: true });
  }

  if (profileQuery.isLoading || settingsQuery.isLoading) return <LoadingState />;
  if (profileQuery.isError || settingsQuery.isError || !profileQuery.data || !settingsQuery.data) {
    return <ErrorState description="Không tải được cài đặt tài khoản." />;
  }

  return (
    <div>
      <PageHeader title="Cài đặt" description="Quản lý tài khoản, quyền riêng tư và gợi ý học tập." />
      {message ? <p className="mb-5 rounded-[16px] border border-blue-100 bg-primary-soft p-4 text-sm text-primary">{message}</p> : null}
      <div className="space-y-6">
        <ProfileForm profile={profileQuery.data} onSave={handleProfileSave} saving={savingProfile} />
        <PrivacySettings settings={settingsQuery.data} onSave={handleSettingsSave} saving={savingSettings} />
        <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
          <h2 className="text-lg font-semibold text-app-text">Phiên đăng nhập</h2>
          <p className="mt-2 text-sm leading-6 text-app-secondary">Đăng xuất khỏi thiết bị hiện tại.</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={handleLogout}>Đăng xuất</Button>
        </section>
      </div>
    </div>
  );
}
