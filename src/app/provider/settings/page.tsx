"use client";

import { ChangeEvent, useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { updateEmail, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/config/firebase.config";
import {
  getBusinessesByProvider,
} from "@/lib/services/business-service";
import {
  type Business,
  type BusinessStatus,
} from "@/types";
import {
  getProviderSettings,
  saveProviderNotifications,
  saveProviderProfile,
  uploadProfileImage,
} from "@/lib/services/settings-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lock,
  Bell,
  User,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  Store,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface ProviderProfile {
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  photoURL: string;
  phone: string;
}

const statusConfig: Record<BusinessStatus, { label: string; icon: React.ElementType; className: string }> = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-500/15 border border-emerald-400/20 text-emerald-300",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/15 border border-amber-400/20 text-amber-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-500/15 border border-red-400/20 text-red-300",
  },
};

export default function ProviderSettingsPage() {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<ProviderProfile>({
    firstName: "",
    lastName: "",
    nic: "",
    email: "",
    photoURL: "",
    phone: "",
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newReviews: true,
    approvalUpdates: true,
    weeklyReport: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const [data, businessList] = await Promise.all([
          getProviderSettings(user.uid, user.email || ""),
          getBusinessesByProvider(user.uid),
        ]);
        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          nic: data.nic,
          email: data.email,
          photoURL: data.photoURL,
          phone: data.phone,
        });
        setBusinesses(businessList);
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await saveProviderProfile(user.uid, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        nic: profile.nic,
        email: profile.email,
        photoURL: profile.photoURL,
        phone: profile.phone,
      });

      // Update Firebase Auth profile
      if (auth.currentUser) {
        if (auth.currentUser.email !== profile.email.trim()) {
          await updateEmail(auth.currentUser, profile.email.trim());
        }

        await updateProfile(auth.currentUser, {
          displayName: `${profile.firstName} ${profile.lastName}`.trim(),
          photoURL: profile.photoURL || null,
        });
      }

      await refreshUserData();

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: unknown) {
      console.error("Error saving profile:", error);
      if ((error as { code?: string })?.code === "auth/requires-recent-login") {
        setMessage({ type: "error", text: "Please sign in again before changing your email." });
        return;
      }
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB." });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const imageUrl = await uploadProfileImage(user.uid, file);
      setProfile((prev) => ({ ...prev, photoURL: imageUrl }));
      setMessage({ type: "success", text: "Profile picture uploaded. Click Save Changes to apply." });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      setMessage({ type: "error", text: "Failed to upload profile image. Please try again." });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleChangePassword = async () => {
    if (!user || !auth.currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully!" });
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      if ((error as { code?: string }).code === "auth/wrong-password") {
        setMessage({ type: "error", text: "Current password is incorrect." });
      } else {
        setMessage({ type: "error", text: "Failed to change password. Please try again." });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await saveProviderNotifications(user.uid, notifications);

      setMessage({ type: "success", text: "Notification preferences saved!" });
    } catch (error) {
      console.error("Error saving notifications:", error);
      setMessage({ type: "error", text: "Failed to save preferences. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your provider account settings</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${message.type === "success"
            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
            : "bg-red-500/10 text-red-300 border border-red-400/20"
          }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Profile Information + Password — 2 col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl p-4 border border-border/60 bg-muted/20">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border border-border"
                  width={64}
                  height={64}
                />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-border bg-muted flex items-center justify-center text-lg font-semibold">
                    {(profile.firstName?.[0] || "U").toUpperCase()}
                  </div>
                )}
              <div className="space-y-2">
                <Label htmlFor="providerProfileImage">Profile Picture</Label>
                <Input
                  id="providerProfileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max size 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <p className="text-xs text-muted-foreground">Changing email may require a recent login.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <Input id="nic" value={profile.nic} onChange={(e) => setProfile({ ...profile, nic: e.target.value })} placeholder="200012345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+94 71 234 5678" />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving || uploadingImage} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword} className="w-full">
              {changingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Your Businesses
          </CardTitle>
          <CardDescription>Businesses linked to your provider account</CardDescription>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No businesses found for this account.</p>
          ) : (
            <div className="space-y-3">
              {businesses.map((business) => {
                const StatusIcon = statusConfig[business.status].icon;

                return (
                  <div key={business.id} className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{business.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{business.category}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig[business.status].className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[business.status].label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
              { key: "newReviews", label: "New Reviews", description: "Notified when customers leave reviews" },
              { key: "approvalUpdates", label: "Approval Updates", description: "Notified when listings are approved or rejected" },
              { key: "weeklyReport", label: "Weekly Report", description: "Receive weekly performance reports" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-white">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications[item.key as keyof typeof notifications]}
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                  className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications[item.key as keyof typeof notifications] ? 'bg-amber-500' : 'bg-white/15'
                    }`}
                >
                  <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveNotifications} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
