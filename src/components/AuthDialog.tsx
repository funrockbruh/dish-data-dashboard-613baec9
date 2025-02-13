
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';

export const AuthDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/verify`,
          }
        });
        
        if (signUpError) throw signUpError;

        // Send our custom verification email
        const { error: emailError } = await supabase.functions.invoke('send-verification', {
          body: {
            email,
            verificationToken: data?.user?.confirmation_sent_at ? 'pending' : null,
          },
        });

        if (emailError) throw emailError;

        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
      } else {
        // First check if the user exists and is verified
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) throw getUserError;

        if (!user) {
          // If no user is found, try to sign in to get more details
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            if (signInError.message.includes('Email not confirmed')) {
              throw new Error("Please verify your email before signing in.");
            }
            throw signInError;
          }

          if (!signInData.user?.email_confirmed_at) {
            throw new Error("Please verify your email before signing in.");
          }
        } else if (!user.email_confirmed_at) {
          throw new Error("Please verify your email before signing in.");
        }

        // If we get here, either the user is verified or we've already thrown an error
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create an account" : "Sign in"}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Sign up to start your free trial"
              : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Loading..."
            ) : isSignUp ? (
              "Sign up"
            ) : (
              "Sign in"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
