
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash;
        
        // Extract the token from the hash
        const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');
        
        if (!token) {
          throw new Error("No verification token found");
        }

        // Get the user's session using the token
        const { data: { user }, error: sessionError } = await supabase.auth.getUser(token);
        
        if (sessionError) throw sessionError;
        
        if (!user) {
          throw new Error("No user found");
        }

        if (user.email_confirmed_at) {
          toast({
            title: "Email already verified",
            description: "Your email has already been verified. You can now sign in.",
          });
          navigate("/");
          return;
        }

        // Update the user's email verification status
        const { error: updateError } = await supabase.auth.updateUser({
          data: { email_verified: true }
        });

        if (updateError) throw updateError;

        toast({
          title: "Email verified",
          description: "Your email has been verified successfully. You can now sign in.",
        });
        navigate("/");

      } catch (error: any) {
        console.error("Verification error:", error);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate, toast]);

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
