import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Settings as SettingsIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UserProfile } from "@/lib/todo/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  initials: string;
  onOpenSettings: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  setProfile,
  initials,
  onOpenSettings,
}: ProfileModalProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    className: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        branch: profile.branch || "",
        className: profile.className || "",
      });
    }
  }, [profile]);

  const handleStartEditProfile = () => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        branch: profile.branch || "",
        className: profile.className || "",
      });
    }
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profileForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setProfile(profileForm);
    setIsEditingProfile(false);
    toast.success("Profile updated successfully!");
  };

  const handleClose = () => {
    onClose();
    setIsEditingProfile(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl border border-border/70 bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Student Profile</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              {profile?.name || "Student"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personal academic details are kept here for quick access.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="profName">Name *</Label>
                <Input
                  id="profName"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profEmail">Email *</Label>
                <Input
                  id="profEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profPhone">Phone Number *</Label>
                <Input
                  id="profPhone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profBranch">Branch</Label>
                  <Input
                    id="profBranch"
                    value={profileForm.branch}
                    onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profClass">Class / Year</Label>
                  <Input
                    id="profClass"
                    value={profileForm.className}
                    onChange={(e) => setProfileForm({ ...profileForm, className: e.target.value })}
                    placeholder="e.g. 2nd Year"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                Save Profile
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xl font-semibold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">Student • Active Learner</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-foreground">{profile?.phone}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-foreground">{profile?.email}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Branch
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {profile?.branch || "Not Specified"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Class
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {profile?.className || "Not Specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleStartEditProfile}
                  className="rounded-xl border-border/70"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose();
                    onOpenSettings();
                  }}
                  className="rounded-xl border-border/70"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Open Settings
                </Button>
              </div>
              <Button
                onClick={handleClose}
                className="rounded-xl"
              >
                Close Profile
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
