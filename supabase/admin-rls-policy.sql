
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
