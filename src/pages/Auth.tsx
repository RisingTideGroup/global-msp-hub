import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<{ token: string; type: "signup" | "recovery" } | null>(
    null,
  );
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Separate Turnstile instances for different forms
  const signInTurnstile = useTurnstile();
  const signUpTurnstile = useTurnstile();
  const resetTurnstile = useTurnstile();

  // Handle authentication flows with structured logic
  useEffect(() => {
    const handleAuthFlow = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      console.log("Auth callback - URL params:", {
        tokenHash: tokenHash ? "present" : "missing",
        type,
        error,
        errorDescription,
        user: user ? "authenticated" : "not authenticated",
        fullUrl: window.location.href,
      });

      // Handle URL errors first
      if (error) {
        console.error("Auth error from URL:", error, errorDescription);
        toast({
          title: "Authentication Error",
          description: errorDescription || error,
          variant: "destructive",
        });
        return;
      }

      // Case 1: Recovery flow - store token for manual verification
      if (tokenHash && type === "recovery") {
        console.log("Recovery token hash found, waiting for user to click verify...");
        setPendingVerification({ token: tokenHash, type: "recovery" });
        return;
      }

      // Case 2: Signup verification - store token for manual verification
      if (tokenHash && type === "signup") {
        console.log("Signup token hash found, waiting for user to click verify...");
        setPendingVerification({ token: tokenHash, type: "signup" });
        return;
      }

      // Case 3: Regular login flow - redirect if authenticated
      if (user) {
        console.log("User authenticated, redirecting to home");
        navigate("/");
      }
    };

    handleAuthFlow();
  }, [searchParams, toast, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters long." };
    if (!/[A-Z]/.test(password))
      return { valid: false, message: "Password must contain at least one uppercase letter." };
    if (!/[a-z]/.test(password))
      return { valid: false, message: "Password must contain at least one lowercase letter." };
    if (!/\d/.test(password)) return { valid: false, message: "Password must contain at least one number." };
    return { valid: true, message: "" };
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(""); // Clear previous errors

    if (!signUpTurnstile.isVerified || !signUpTurnstile.token) {
      setSignUpError("Please complete the security check before signing up.");
      return;
    }

    // Input validation
    if (!validateEmail(email)) {
      setSignUpError("Please enter a valid email address.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setSignUpError(passwordValidation.message);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setSignUpError("Please enter your first and last name.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth`,
          // Only include captchaToken in production
          ...(signUpTurnstile.isBypassed ? {} : { captchaToken: signUpTurnstile.token }),
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      // Reset form and turnstile
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setSignUpError("");
      signUpTurnstile.reset();
    } catch (error: any) {
      setSignUpError(error.message || "An error occurred during sign up. Please try again.");
      signUpTurnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(""); // Clear previous errors

    if (!signInTurnstile.isVerified || !signInTurnstile.token) {
      setSignInError("Please complete the security check before signing in.");
      return;
    }

    // Input validation
    if (!validateEmail(email)) {
      setSignInError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: {
          // Only include captchaToken in production
          ...(signInTurnstile.isBypassed ? {} : { captchaToken: signInTurnstile.token }),
        },
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      navigate("/");
    } catch (error: any) {
      console.log("Sign-in error occurred:", error.message);

      // Check if error is due to unverified email
      if (
        error.message?.toLowerCase().includes("email not confirmed") ||
        error.message?.toLowerCase().includes("verify")
      ) {
        setSignInError("Please verify your email address before signing in.");
        setShowResendVerification(true);
        setResendEmail(email);
      } else {
        setSignInError(error.message || "An error occurred during sign in. Please try again.");
      }

      // Force reset the Turnstile widget on any auth error
      console.log("Resetting Turnstile due to auth error");
      signInTurnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!validateEmail(resendEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your email to verify your account.",
      });

      setShowResendVerification(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleManualVerification = async () => {
    if (!pendingVerification) return;

    setVerifyingEmail(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: pendingVerification.token,
        type: pendingVerification.type,
      });

      if (verifyError) {
        console.error("Verification error:", verifyError);

        // Check if user is already verified
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser?.email_confirmed_at) {
          toast({
            title: "Already Verified",
            description: "Your email was already verified. You can sign in now.",
          });
          navigate("/auth", { replace: true });
        } else {
          throw verifyError;
        }
        return;
      }

      console.log("Verification successful:", data);

      if (pendingVerification.type === "recovery") {
        toast({
          title: "Password Reset",
          description: "Redirecting to profile to set your new password.",
        });
        navigate("/profile?reset=true", { replace: true });
      } else {
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "This link is invalid or has expired.",
        variant: "destructive",
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(resetEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!resetTurnstile.isVerified || !resetTurnstile.token) {
      toast({
        title: "Security Check Required",
        description: "Please complete the security check before requesting password reset.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth`,
        // Only include captchaToken in production
        ...(resetTurnstile.isBypassed ? {} : { captchaToken: resetTurnstile.token }),
      });

      if (error) throw error;

      toast({
        title: "Reset email sent!",
        description: "Check your email for a password reset link.",
      });

      setResetEmail("");
      resetTurnstile.reset();
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      resetTurnstile.reset();
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      <div className="flex items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md">
          {pendingVerification ? (
            // Verification confirmation screen
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-brand-primary">
                  {pendingVerification.type === "signup" ? "Verify Your Email" : "Reset Your Password"}
                </CardTitle>
                <CardDescription>
                  {pendingVerification.type === "signup"
                    ? "Click the button below to complete your email verification."
                    : "Click the button below to confirm your password reset."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground text-center">
                    <p>
                      {pendingVerification.type === "signup"
                        ? "Once verified, you will be automatically redirected."
                        : "This confirms you want to reset your password."}
                    </p>
                  </div>
                  <Button onClick={handleManualVerification} disabled={verifyingEmail} className="w-full" size="lg">
                    {verifyingEmail
                      ? "Verifying..."
                      : pendingVerification.type === "signup"
                        ? "Verify Email"
                        : "Confirm Password Reset"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPendingVerification(null);
                      navigate("/auth", { replace: true });
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // Normal sign in/sign up forms
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-brand-primary">JobMatch</CardTitle>
                <CardDescription>Connect with companies that share your values</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setSignInError(""); // Clear error on input
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setSignInError(""); // Clear error on input
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Security Check</Label>
                        <TurnstileWidget
                          onSuccess={signInTurnstile.handleSuccess}
                          onError={signInTurnstile.handleError}
                          onResetReady={signInTurnstile.setTurnstileReset}
                          className="flex justify-center"
                        />
                      </div>

                      {signInError && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                          <p>{signInError}</p>
                          {showResendVerification && (
                            <Button
                              type="button"
                              variant="link"
                              className="p-0 h-auto text-destructive underline mt-2"
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                            >
                              {resendLoading ? "Sending..." : "Resend verification email"}
                            </Button>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90"
                        disabled={loading || !signInTurnstile.isVerified}
                      >
                        {loading ? "Signing In..." : "Sign In"}
                      </Button>

                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm text-accent hover:text-accent/90"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              setSignUpError(""); // Clear error on input
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              setSignUpError(""); // Clear error on input
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setSignUpError(""); // Clear error on input
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setSignUpError(""); // Clear error on input
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Security Check</Label>
                        <TurnstileWidget
                          onSuccess={signUpTurnstile.handleSuccess}
                          onError={signUpTurnstile.handleError}
                          onResetReady={signUpTurnstile.setTurnstileReset}
                          className="flex justify-center"
                        />
                      </div>

                      {signUpError && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                          {signUpError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90"
                        disabled={loading || !signUpTurnstile.isVerified}
                      >
                        {loading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Footer />

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Security Check</Label>
              <TurnstileWidget
                onSuccess={resetTurnstile.handleSuccess}
                onError={resetTurnstile.handleError}
                onResetReady={resetTurnstile.setTurnstileReset}
                className="flex justify-center"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetLoading || !resetTurnstile.isVerified}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
