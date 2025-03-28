
-- This is an SQL file that can be executed in the Supabase SQL Editor
-- Create a policy that allows admin users to access all payments
CREATE POLICY "Admin users can access all payments" 
ON public.payments 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.email()
  )
);

-- Create a policy that allows admin users to access all subscriptions
CREATE POLICY "Admin users can access all subscriptions" 
ON public.subscriptions 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = auth.email()
  )
);

-- Create profiles RLS policy for users to manage their own profiles
CREATE POLICY "Users can manage their own profiles"
ON public.restaurant_profiles
FOR ALL
TO authenticated
USING (id = auth.uid());

-- Create subscription access policy that doesn't reference users table
CREATE POLICY "Users can access their own subscriptions" 
ON public.subscriptions 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- Create payment access policy that doesn't reference users table
CREATE POLICY "Users can access their own payments" 
ON public.payments 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());
