// frontend/admin-crm/src/pages/settings/accounts/MyProfile.tsx
import React from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import Profile from "../../profile/Profile";

/**
 * Wrapper component that renders the Profile component within the Settings layout
 */
const MyProfile: React.FC = () => {
  return (
    <SettingsLayout
      title="My Profile"
      description="Manage your personal information and account settings"
    >
      <Profile inSettingsLayout={true} />
    </SettingsLayout>
  );
};

export default MyProfile;
