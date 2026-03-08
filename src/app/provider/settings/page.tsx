"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "@/config/firebase.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Lock,
  Bell,
  Building2,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ProviderProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  website: string;
}

export default function ProviderSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<ProviderProfile>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
  });

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
        // Try providers collection first, then users collection
        let docRef = doc(db, "providers", user.uid);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          docRef = doc(db, "users", user.uid);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            businessName: data.businessName || "",
            ownerName: data.ownerName || data.firstName + " " + data.lastName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            website: data.website || "",
          });

          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
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
      // Update Firestore
      const docRef = doc(db, "providers", user.uid);
      await updateDoc(docRef, {
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address,
        description: profile.description,
        website: profile.website,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profile.ownerName,
        });
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
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
      const docRef = doc(db, "providers", user.uid);
      await updateDoc(docRef, {
        notifications,
        updatedAt: new Date(),
      });

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

      {/* Business Profile + Password — 2 col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>Update your business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" value={profile.ownerName} onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+94 71 234 5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} rows={3} placeholder="Tell customers about your business…" />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
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
