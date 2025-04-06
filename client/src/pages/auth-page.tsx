import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { FaEye, FaEyeSlash, FaComments, FaUserPlus } from 'react-icons/fa';
import {
  AuthContainer,
  AuthWrapper,
  AuthTabs,
  AuthTab,
  AuthCard,
  LogoContainer,
  LogoCircle,
  AuthTitle,
  
  PasswordInputWrapper,
  PasswordToggleButton,
  FormHelper,
  CheckboxContainer,
  CheckboxLabel,
  ActionRow,
  ForgotPasswordLink,
  SubmitButton
} from '@/components/styled/AuthComponents';
import { FormGroup, Label, Input } from '@/components/styled/index';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoginLoading(true);
      await login(loginUsername, loginPassword);
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerPassword || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: 'Terms agreement required',
        description: 'You must agree to the terms of service',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsRegisterLoading(true);
      await register(registerUsername, registerPassword);
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthWrapper>
        <AuthTabs>
          <AuthTab
            $active={activeTab === 'login'}
            onClick={() => setActiveTab('login')}
          >
            Login
          </AuthTab>
          <AuthTab
            $active={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            Register
          </AuthTab>
        </AuthTabs>

        <AuthCard>
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <LogoContainer>
                <LogoCircle>
                  <FaComments />
                </LogoCircle>
              </LogoContainer>
              <AuthTitle>Welcome Back!</AuthTitle>

              <FormGroup>
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="login-password">Password</Label>
                <PasswordInputWrapper>
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggleButton>
                </PasswordInputWrapper>
              </FormGroup>

              <ActionRow>
                <CheckboxContainer>
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <CheckboxLabel htmlFor="remember-me">Remember me</CheckboxLabel>
                </CheckboxContainer>
                <ForgotPasswordLink href="#">Forgot password?</ForgotPasswordLink>
              </ActionRow>

              <SubmitButton type="submit" disabled={isLoginLoading || isLoading}>
                {isLoginLoading ? 'Logging in...' : 'Log In'}
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <LogoContainer>
                <LogoCircle>
                  <FaUserPlus />
                </LogoCircle>
              </LogoContainer>
              <AuthTitle>Create Account</AuthTitle>

              <FormGroup>
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="register-password">Password</Label>
                <PasswordInputWrapper>
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggleButton>
                </PasswordInputWrapper>
                <FormHelper>Password must be at least 6 characters</FormHelper>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="register-confirm">Confirm Password</Label>
                <PasswordInputWrapper>
                  <Input
                    id="register-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggleButton>
                </PasswordInputWrapper>
              </FormGroup>

              <FormGroup>
                <CheckboxContainer>
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                  />
                  <CheckboxLabel htmlFor="terms">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                  </CheckboxLabel>
                </CheckboxContainer>
              </FormGroup>

              <SubmitButton type="submit" disabled={isRegisterLoading || isLoading}>
                {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
              </SubmitButton>
            </form>
          )}
        </AuthCard>
      </AuthWrapper>
    </AuthContainer>
  );
}
