import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

  const doLogin = async () => {
    setLErr('');
    if (!lEmail || !lPass) { setLErr('Please enter your email and password.'); return; }
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
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="shadow-neu-card neu-screws rounded-xl p-7 w-full max-w-[420px] bg-background animate-fade-in relative">

          {/* Vent slots */}
          <div className="absolute top-5 right-8 flex gap-1">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold tracking-tight">
              FEED<span className="text-primary">SENSE</span>
            </div>
            <div className="text-sm font-bold text-foreground mt-1.5">Customer Portal</div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
              Sign in to submit & track feedback
            </div>
          </div>

          {/* Tab switcher — recessed groove */}
          <div className="shadow-neu-recessed rounded-lg p-1.5 flex gap-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-mechanical ${
                tab === 'login'
                  ? 'shadow-neu-card text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >Sign in</button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-mechanical ${
                tab === 'signup'
                  ? 'shadow-neu-card text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >Create Account</button>
          </div>

          {tab === 'login' ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <Label className="mb-2 block">Email Address</Label>
                <Input value={lEmail} onChange={e => setLEmail(e.target.value)} type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label className="mb-2 block">Password</Label>
                <Input value={lPass} onChange={e => setLPass(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
              </div>
              {lErr && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                  <span className="led led-red w-2 h-2 shrink-0" />
                  {lErr}
                </div>
              )}
              <Button onClick={doLogin} disabled={loading} className="mt-1">
                {loading ? <span className="spinner mr-2" /> : null}Sign in
              </Button>
              <div className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                New customer?{' '}
                <button onClick={() => setTab('signup')} className="text-primary font-bold hover:underline">
                  Create account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block">First Name</Label>
                  <Input value={sFname} onChange={e => setSFname(e.target.value)} placeholder="Priya" />
                </div>
                <div>
                  <Label className="mb-2 block">Last Name</Label>
                  <Input value={sLname} onChange={e => setSLname(e.target.value)} placeholder="Sharma" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Email Address</Label>
                <Input value={sEmail} onChange={e => setSEmail(e.target.value)} type="email" placeholder="you@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block">Age</Label>
                  <Input value={sAge} onChange={e => setSAge(e.target.value)} type="number" min={10} max={100} placeholder="28" />
                </div>
                <div>
                  <Label className="mb-2 block">Gender</Label>
                  <select value={sGender} onChange={e => setSGender(e.target.value)}
                    className="flex h-14 w-full rounded-md border-none bg-background px-6 py-3 font-mono text-sm shadow-neu-recessed focus-visible:outline-none focus-visible:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_hsl(var(--primary))]">
                    <option value="">Select…</option>
                    <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Password</Label>
                <Input value={sPass} onChange={e => setSPass(e.target.value)} type="password" placeholder="Min. 6 characters" />
              </div>
              <div>
                <Label className="mb-2 block">Confirm Password</Label>
                <Input value={sPass2} onChange={e => setSPass2(e.target.value)} type="password" placeholder="Repeat password" />
              </div>
              {sErr && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 shadow-neu-recessed rounded-md p-3">
                  <span className="led led-red w-2 h-2 shrink-0" />
                  {sErr}
                </div>
              )}
              <Button onClick={doSignup} disabled={loading} className="mt-1">
                {loading ? <span className="spinner mr-2" /> : null}Create Account
              </Button>
              <div className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-bold hover:underline">
                  Sign in
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-5">
            <button onClick={() => navigate('/')} className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              ← Back to portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
