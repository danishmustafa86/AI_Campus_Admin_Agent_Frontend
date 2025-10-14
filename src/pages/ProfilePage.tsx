import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  Key,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProfileUpdateRequest } from "@/types";

interface ProfileForm {
  email: string;
  full_name: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const ProfilePage = () => {
  const { user, loadUser } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      email: user?.email || "",
      full_name: user?.full_name || "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        full_name: user.full_name || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  }, [user, reset]);

  const newPassword = watch("new_password");

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);

    // Validate password confirmation if changing password
    if (isChangingPassword) {
      if (data.new_password !== data.confirm_password) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data.current_password) {
        toast({
          title: "Error",
          description: "Current password is required to change password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const updateData: ProfileUpdateRequest = {
        email: data.email !== user?.email ? data.email : undefined,
        full_name: data.full_name !== user?.full_name ? data.full_name : undefined,
      };

      if (isChangingPassword && data.new_password) {
        updateData.current_password = data.current_password;
        updateData.new_password = data.new_password;
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof ProfileUpdateRequest] === undefined) {
          delete updateData[key as keyof ProfileUpdateRequest];
        }
      });

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to your profile",
        });
        setIsEditing(false);
        setIsChangingPassword(false);
        setIsLoading(false);
        return;
      }

      await authApi.updateProfile(updateData);
      
      // Reload user data
      await loadUser();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      setIsChangingPassword(false);
      reset({
        email: data.email,
        full_name: data.full_name,
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      
      let errorMessage = "Failed to update profile";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    reset({
      email: user?.email || "",
      full_name: user?.full_name || "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const getInitials = (name?: string, username?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return username?.substring(0, 2).toUpperCase() || "U";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                {getInitials(user.full_name, user.username)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-semibold">
                {user.full_name || user.username}
              </h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {user.is_admin && (
                <Badge className="bg-gradient-primary">
                  <Shield className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            <Separator />

            <div className="w-full space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground break-all">{user.email}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {formatDate(user.created_at)}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Account Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your personal information and password
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              {isEditing && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold">Change Password</h4>
                        <p className="text-xs text-muted-foreground">
                          Update your password to keep your account secure
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={isChangingPassword ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        {isChangingPassword ? "Cancel" : "Change Password"}
                      </Button>
                    </div>

                    {isChangingPassword && (
                      <Alert>
                        <AlertDescription className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="current_password"
                                type={showCurrentPassword ? "text" : "password"}
                                {...register("current_password", {
                                  required: isChangingPassword
                                    ? "Current password is required"
                                    : false,
                                })}
                                placeholder="Enter current password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {errors.current_password && (
                              <p className="text-sm text-destructive">
                                {errors.current_password.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <div className="relative">
                              <Input
                                id="new_password"
                                type={showNewPassword ? "text" : "password"}
                                {...register("new_password", {
                                  required: isChangingPassword
                                    ? "New password is required"
                                    : false,
                                  minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters",
                                  },
                                })}
                                placeholder="Enter new password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {errors.new_password && (
                              <p className="text-sm text-destructive">
                                {errors.new_password.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                id="confirm_password"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirm_password", {
                                  required: isChangingPassword
                                    ? "Please confirm your new password"
                                    : false,
                                  validate: (value) =>
                                    !isChangingPassword ||
                                    value === newPassword ||
                                    "Passwords do not match",
                                })}
                                placeholder="Confirm new password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {errors.confirm_password && (
                              <p className="text-sm text-destructive">
                                {errors.confirm_password.message}
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-primary hover:bg-gradient-primary/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Additional information about your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Account ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Account Status</Label>
              <div className="flex items-center space-x-2">
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <p className="text-sm text-muted-foreground">
                {user.is_admin ? "Administrator" : "User"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(user.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

