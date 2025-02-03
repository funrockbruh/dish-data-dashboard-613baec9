import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const email = searchParams.get("email");
        if (!email) throw new Error("No email provided");

        // Get the session to check if the user is already verified
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user?.email_confirmed_at) {
          toast({
            title: "Email already verified",
            description: "Your email has already been verified. You can now sign in.",
          });
          navigate("/");
          return;
        }

        // Verify the email directly
        const { error: verificationError } = await supabase.auth.verifyOtp({
          email,
          type: 'signup',
          token: searchParams.get('token') || '',
        });

        if (verificationError) {
          console.error("Verification error:", verificationError);
          toast({
            title: "Verification failed",
            description: "Unable to verify your email. Please try signing up again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully. You can now sign in.",
          });
          navigate("/");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {verifying ? "Verifying your email..." : "Email Verification"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {verifying
            ? "Please wait while we verify your email address."
            : "Verification complete. You can now sign in to your account."}
        </p>
      </div>
    </div>
  );
};

export default Verify;