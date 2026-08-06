import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export function Login({ onLogin }: { onLogin: () => void }) {
  const { t, dir } = useLocale();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    console.log('Login: Attempting sign-in for:', values.email);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword(values);

    if (authError) {
      console.error('Login: Sign-in failed:', authError.message);
      setError(authError.message);
      return;
    }

    console.log('Login: Sign-in successful for:', data.user?.email);
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4" dir={dir}>
      <div className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">THAI STY</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Desktop Authorization</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">{t.admin.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@thaisty.com"
              {...register("email")}
              className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">{t.admin.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white outline-none focus:border-primary/50 transition-all"
            />
          </div>
          {error && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,140,0,0.2)] mt-4"
          >
            {isSubmitting ? 'Authenticating...' : t.admin.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
