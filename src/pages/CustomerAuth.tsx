import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { ADMIN_EMAILS_BY_CATEGORY } from '@/lib/constants';

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  // Login
  const [lEmail, setLEmail] = useState('');
  const [lPass, setLPass] = useState('');
  const [lErr, setLErr] = useState('');

  // Signup
  const [sFname, setSFname] = useState('');
  const [sLname, setSLname] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sAge, setSAge] = useState('');
  const [sGender, setSGender] = useState('');
  const [sPass, setSPass] = useState('');
  const [sPass2, setSPass2] = useState('');
  const [sErr, setSErr] = useState('');

  // Password visibility states
  const [showLPass, setShowLPass] = useState(false);
  const [showSPass, setShowSPass] = useState(false);
  const [showSPass2, setShowSPass2] = useState(false);

  const doLogin = async () => {
    setLErr('');
    if (!lEmail || !lPass) { setLErr('Please enter your email and password.'); return; }

    const normalizedEmail = lEmail.trim().toLowerCase();
    const allAdminEmails = Object.values(ADMIN_EMAILS_BY_CATEGORY).flat().map(e => e.toLowerCase());
    if (allAdminEmails.includes(normalizedEmail)) {
      setLErr('Admin accounts cannot be used in the customer portal.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: lEmail, password: lPass });
      if (error) { setLErr(error.message); return; }

      const { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profileError) {
        setLErr(profileError.message);
        await supabase.auth.signOut();
        return;
      }

      if (!profile) {
        const metadata = data.user.user_metadata ?? {};
        const firstName = String(metadata.first_name ?? '').trim();
        const lastName = String(metadata.last_name ?? '').trim();
        const gender = String(metadata.gender ?? '').trim();
        const parsedAge = Number.parseInt(String(metadata.age ?? ''), 10);

        const emailName = String(data.user.email ?? '').split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ').trim();
        const emailParts = emailName.split(/\s+/).filter(Boolean);
        const fallbackFirstName = emailParts[0] ? emailParts[0][0].toUpperCase() + emailParts[0].slice(1) : 'Customer';
        const emailTail = emailParts.slice(1).join(' ');
        const fallbackLastName = emailTail ? emailTail[0].toUpperCase() + emailTail.slice(1) : 'User';

        const normalizedFirstName = firstName || fallbackFirstName;
        const normalizedLastName = lastName || fallbackLastName;
        const normalizedGender = gender || null;
        const normalizedAge = Number.isNaN(parsedAge) ? null : parsedAge;

        const { error: createProfileError } = await supabase.from('customer_profiles').upsert({
          user_id: data.user.id,
          first_name: normalizedFirstName,
          last_name: normalizedLastName,
          age: normalizedAge,
          gender: normalizedGender,
        }, { onConflict: 'user_id' });

        if (createProfileError) {
          setLErr(createProfileError.message);
          await supabase.auth.signOut();
          return;
        }
      }

      toast.success('Welcome back! 👋');
      navigate('/customer');
    } finally {
      setLoading(false);
    }
  };

  const doSignup = async () => {
    setSErr('');
    if (!sFname || !sLname || !sEmail || !sAge || !sGender || !sPass || !sPass2) { setSErr('Please fill in all fields.'); return; }

    const normalizedEmail = sEmail.trim().toLowerCase();
    const allAdminEmails = Object.values(ADMIN_EMAILS_BY_CATEGORY).flat().map(e => e.toLowerCase());
    if (allAdminEmails.includes(normalizedEmail)) {
      setSErr('Admin accounts cannot be used to create customer profiles.');
      return;
    }

    if (sPass.length < 6) { setSErr('Password must be at least 6 characters.'); return; }
    if (sPass !== sPass2) { setSErr('Passwords do not match.'); return; }
    const parsedAge = Number.parseInt(sAge, 10);
    if (Number.isNaN(parsedAge)) { setSErr('Please enter a valid age.'); return; }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: sEmail,
      password: sPass,
      options: {
        data: {
          first_name: sFname,
          last_name: sLname,
          age: parsedAge,
          gender: sGender,
          role: 'customer',
        },
      },
    });
    if (error) {
      const alreadyRegistered = /user already registered/i.test(error.message);
      if (!alreadyRegistered) { setSErr(error.message); setLoading(false); return; }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: sEmail,
        password: sPass,
      });
      if (loginError || !loginData.user) {
        setSErr('This email is already registered. Please sign in with your existing password.');
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('customer_profiles').upsert({
        user_id: loginData.user.id,
        first_name: sFname,
        last_name: sLname,
        age: parsedAge,
        gender: sGender,
      }, { onConflict: 'user_id' });
      if (profileError) { setSErr(profileError.message); setLoading(false); return; }

      setLoading(false);
      toast.success('Account already existed. Customer profile has been completed.');
      navigate('/customer');
      return;
    }

    if (!data.user) {
      setSErr('Unable to create account right now. Please try again.');
      setLoading(false);
      return;
    }

    if (data.session) {
      const { error: profileError } = await supabase.from('customer_profiles').upsert({
        user_id: data.user.id,
        first_name: sFname,
        last_name: sLname,
        age: parsedAge,
        gender: sGender,
      }, { onConflict: 'user_id' });
      if (profileError) { setSErr(profileError.message); setLoading(false); return; }

      setLoading(false);
      toast.success(`Welcome, ${sFname}! Your account is ready. 🎉`);
      navigate('/customer');
      return;
    }

    setLoading(false);
    toast.success('Account created. Verify your email, then sign in to finish setup.');
    setTab('login');
    setLEmail(sEmail);
    setLPass('');
  };

  return (
    <div className="auth-page flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="shadow-neu-card neu-screws rounded-xl px-6 py-[18px] sm:px-7 sm:py-[18px] w-full max-w-[420px] bg-background animate-fade-in relative max-h-[92vh] overflow-y-auto hide-scrollbar flex flex-col justify-center">

          {/* Vent slots */}
          <div className="absolute top-4 right-8 flex gap-1">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>

          {/* Header */}
          <div className="text-center mb-4 flex flex-col items-center">
            <div className="logo-wrapper mb-4">
              <img src="/logo-transparent.png" alt="FeedSense Logo" className="logo-img" />
            </div>
            <div className="text-sm font-bold text-foreground my-[4px]">Customer Portal</div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest my-[4px]">
              Sign in to submit & track feedback
            </div>
          </div>

          {/* Tab switcher — recessed groove */}
          <div className="shadow-neu-recessed rounded-lg p-1.5 flex gap-1 mb-4">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-mechanical ${
                tab === 'login'
                  ? 'shadow-neu-card text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >Sign in</button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-1.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-mechanical ${
                tab === 'signup'
                  ? 'shadow-neu-card text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >Create Account</button>
          </div>

          {tab === 'login' ? (
            <div className="flex flex-col gap-[10px] animate-fade-in">
              <div>
                <Label className="mb-1 block text-xs">Email Address</Label>
                <Input value={lEmail} onChange={e => setLEmail(e.target.value)} type="email" placeholder="you@example.com" className="h-[38px] text-[14px]" />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Password</Label>
                <div className="relative w-full">
                  <Input value={lPass} onChange={e => setLPass(e.target.value)} type={showLPass ? "text" : "password"} placeholder="••••••••" className="h-[38px] text-[14px] pr-10" onKeyDown={e => e.key === 'Enter' && doLogin()} />
                  <button type="button" onClick={() => setShowLPass(!showLPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Toggle password visibility">
                    {showLPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {lErr && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                  <span className="led led-red w-2 h-2 shrink-0" />
                  {lErr}
                </div>
              )}
              <Button onClick={doLogin} disabled={loading} className="w-full mt-[10px]">
                {loading ? <span className="spinner mr-2" /> : null}Sign in
              </Button>
              <div className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                New customer?{' '}
                <button onClick={() => setTab('signup')} className="text-primary font-bold hover:underline">
                  Create account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[10px] animate-fade-in">
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <Label className="mb-1 block text-xs">First Name</Label>
                  <Input value={sFname} onChange={e => setSFname(e.target.value)} placeholder="Priya" className="h-[38px] text-[14px]" />
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Last Name</Label>
                  <Input value={sLname} onChange={e => setSLname(e.target.value)} placeholder="Sharma" className="h-[38px] text-[14px]" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Email Address</Label>
                <Input value={sEmail} onChange={e => setSEmail(e.target.value)} type="email" placeholder="you@example.com" className="h-[38px] text-[14px]" />
              </div>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <Label className="mb-1 block text-xs">Age</Label>
                  <Input value={sAge} onChange={e => setSAge(e.target.value)} type="number" min={10} max={100} placeholder="28" className="h-[38px] text-[14px]" />
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Gender</Label>
                  <select value={sGender} onChange={e => setSGender(e.target.value)}
                    className="flex h-[38px] w-full rounded-md border-none bg-background px-3 py-2 font-mono text-[14px] shadow-neu-recessed focus-visible:outline-none focus-visible:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_hsl(var(--primary))]">
                    <option value="">Select…</option>
                    <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Password</Label>
                <div className="relative w-full">
                  <Input value={sPass} onChange={e => setSPass(e.target.value)} type={showSPass ? "text" : "password"} placeholder="Min. 6 characters" className="h-[38px] text-[14px] pr-10" />
                  <button type="button" onClick={() => setShowSPass(!showSPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Toggle password visibility">
                    {showSPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Confirm Password</Label>
                <div className="relative w-full">
                  <Input value={sPass2} onChange={e => setSPass2(e.target.value)} type={showSPass2 ? "text" : "password"} placeholder="Repeat password" className="h-[38px] text-[14px] pr-10" />
                  <button type="button" onClick={() => setShowSPass2(!showSPass2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Toggle password visibility">
                    {showSPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {sErr && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                  <span className="led led-red w-2 h-2 shrink-0" />
                  {sErr}
                </div>
              )}
              <Button onClick={doSignup} disabled={loading} className="w-full mt-[10px]">
                {loading ? <span className="spinner mr-2" /> : null}Create Account
              </Button>
              <div className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-bold hover:underline">
                  Sign in
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-3">
            <button onClick={() => navigate('/')} className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              ← Back to portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
