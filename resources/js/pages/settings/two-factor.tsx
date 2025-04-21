import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Copy, Eye, EyeOff, Loader, ScanLine, LockKeyhole } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: '/settings/two-factor',
    },
];

interface TwoFactorProps {
    confirmed: boolean;
    recoveryCodes: string[];
}

export default function TwoFactor({ confirmed: initialConfirmed, recoveryCodes }: TwoFactorProps) {
    const [confirmed, setConfirmed] = useState(initialConfirmed);
    const [showModal, setShowModal] = useState(false);
    const [verifyStep, setVerifyStep] = useState(false);
    const [qrCodeSvg, setQrCodeSvg] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(false);
    const [recoveryCodesList, setRecoveryCodesList] = useState(recoveryCodes);
    const [copied, setCopied] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (showModal && !verifyStep && !qrCodeSvg) {
            fetchQrCode();
        }
    }, [showModal, verifyStep]);

    interface FlashData {
        qrCode?: string;
        secret?: string;
        recovery_codes?: string[];
        status?: string;
    }

    interface ApiResponse {
        status: string;
        qrCode?: string;
        svg?: string;
        secret?: string;
        recovery_codes?: string[];
    }

    const fetchQrCode = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(route('two-factor.enable'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data: ApiResponse = await response.json();

                if (data.qrCode) {
                    setQrCodeSvg(data.qrCode);
                } else if (data.svg) {
                    // Handle both possible response formats
                    setQrCodeSvg(data.svg);
                }

                if (data.secret) {
                    setSecretKey(data.secret);
                }

                if (data.recovery_codes) {
                    setRecoveryCodesList(data.recovery_codes);
                }
            } else {
                console.error('Error enabling 2FA:', response.statusText);
            }
        } catch (error) {
            console.error('Error enabling 2FA:', error);
        }
    };

    // Use recovery codes that are already in the props
    const showRecoveryCodes = () => {
        setShowingRecoveryCodes(true);
    };

    // No longer needed as recovery codes are returned from the confirm endpoint
    // Keeping this as a placeholder in case we need to fetch recovery codes separately in the future
    const fetchRecoveryCodes = async () => {
        showRecoveryCodes();
    };

    const verifyTwoFactorCode = async () => {
        if (!passcode || passcode.length !== 6) {
            return;
        }

        // Make sure the code is properly formatted (no spaces, exactly 6 digits)
        const formattedCode = passcode.replace(/\s+/g, '').trim();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(route('two-factor.confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    code: formattedCode
                })
            });

            if (response.ok) {
                const responseData = await response.json();

                // Update recovery codes if they're returned
                if (responseData.recovery_codes) {
                    setRecoveryCodesList(responseData.recovery_codes);
                }

                setConfirmed(true);
                setVerifyStep(false);
                setShowModal(false);
                showRecoveryCodes(); // Show recovery codes immediately
                setPasscode(''); // Reset passcode
                setError(''); // Clear any errors
            } else {
                const errorData = await response.json();
                console.error('Verification error:', errorData.message);
                setError(errorData.message || 'Invalid verification code');
                setPasscode(''); // Clear the code field
            }
        } catch (error) {
            console.error('Error confirming 2FA:', error);
            setError('An error occurred while confirming 2FA');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    interface RecoveryCodesResponse {
        status: string;
        recovery_codes: string[];
    }

    const regenerateRecoveryCodes = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(route('two-factor.regenerate-recovery-codes'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data: ApiResponse = await response.json();

                if (data.recovery_codes) {
                    setRecoveryCodesList(data.recovery_codes);
                }
            } else {
                console.error('Error regenerating codes:', response.statusText);
            }
        } catch (error) {
            console.error('Error regenerating codes:', error);
        }
    };

    const disableTwoFactorAuthentication = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(route('two-factor.disable'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                setConfirmed(false);
                setShowingRecoveryCodes(false);
                setRecoveryCodesList([]);
                setQrCodeSvg('');
                setSecretKey('');
            } else {
                console.error('Error disabling 2FA:', response.statusText);
            }
        } catch (error) {
            console.error('Error disabling 2FA:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Two-Factor Authentication"
                        description="Add additional security to your account using two-factor authentication."
                    />

                    {!confirmed && (
                        <div className="flex flex-col items-start justify-start space-y-5">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
                                Disabled
                            </Badge>
                            <p className="-translate-y-1 text-stone-500 dark:text-stone-400">
                                When you enable 2FA, you'll be prompted for a secure code during login, which can be retrieved from your phone's Google Authenticator app.
                            </p>
                            <Dialog open={showModal} onOpenChange={setShowModal}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setShowModal(true)}>
                                        Enable
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader className="flex items-center justify-center">
                                        <div className="p-0.5 w-auto rounded-full border mb-3 border-stone-100 dark:border-stone-600 bg-white dark:bg-stone-800 shadow-sm">
                                            <div className="p-2.5 rounded-full border border-stone-200 dark:border-stone-600 overflow-hidden bg-stone-100 dark:bg-stone-200 relative">
                                                {/* Checkerboard lines */}
                                                <div className="flex items-stretch absolute inset-0 w-full h-full divide-x [&>div]:flex-1 divide-stone-200 dark:divide-stone-300 justify-around opacity-50">
                                                    {[...Array(5)].map((_, i) => <div key={i}></div>)}
                                                </div>
                                                <div className="flex flex-col items-stretch absolute w-full h-full divide-y [&>div]:flex-1 inset-0 divide-stone-200 dark:divide-stone-300 justify-around opacity-50">
                                                    {[...Array(5)].map((_, i) => <div key={i}></div>)}
                                                </div>
                                                <ScanLine className="size-6 relative z-20 dark:text-black" />
                                            </div>
                                        </div>
                                        <DialogTitle>{!verifyStep ? 'Turn on 2-step Verification' : 'Verify Authentication Code'}</DialogTitle>
                                        <DialogDescription className="text-center">
                                            {!verifyStep ? 'Open your authenticator app and choose Scan QR code' : 'Enter the 6-digit code from your authenticator app'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="relative w-full items-center justify-center flex flex-col space-y-5">
                                        {!verifyStep ? (
                                            <>
                                                <div className="relative max-w-md mx-auto overflow-hidden flex items-center p-8 pt-0">
                                                    <div className="border border-stone-200 dark:border-stone-700 rounded-lg relative overflow-hidden w-64 aspect-square mx-auto">
                                                        {!qrCodeSvg ? (
                                                            <div className="bg-white dark:bg-stone-700 animate-pulse flex items-center justify-center absolute inset-0 w-full h-auto aspect-square z-10">
                                                                <Loader className="size-6 animate-spin" />
                                                            </div>
                                                        ) : (
                                                            <img src={`data:image/svg+xml;base64,${qrCodeSvg}`} style={{ width: '100%', height: 'auto' }} className="relative z-10" alt="QR Code" />
                                                        )}
                                                    </div>
                                                    {qrCodeSvg && (
                                                        <div className="h-1/2 z-20 w-full border-t border-blue-500 absolute bottom-0 left-0 -translate-y-4">
                                                            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-500 to-transparent opacity-20"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-5 w-full">
                                                    <Button className="w-full" onClick={() => setVerifyStep(true)}>
                                                        Continue
                                                    </Button>
                                                </div>
                                                <div className="flex items-center relative w-full justify-center">
                                                    <div className="w-full absolute inset-0 top-1/2 bg-stone-200 dark:bg-stone-600 h-px"></div>
                                                    <span className="px-2 py-1 bg-white dark:bg-stone-800 relative">or, enter the code manually</span>
                                                </div>
                                                <div className="flex items-center justify-center w-full space-x-2">
                                                    <div className="w-full rounded-xl flex items-stretch border dark:border-stone-700 overflow-hidden">
                                                        {!secretKey ? (
                                                            <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-700 p-3">
                                                                <Loader className="size-4 animate-spin" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    readOnly
                                                                    value={secretKey}
                                                                    className="w-full h-full p-3 text-black dark:text-stone-100 bg-white dark:bg-stone-800"
                                                                />
                                                                <button
                                                                    onClick={() => copyToClipboard(secretKey)}
                                                                    className="block relative border-l border-stone-200 dark:border-stone-600 px-3 hover:bg-stone-100 dark:hover:bg-stone-600 h-auto"
                                                                >
                                                                    {!copied ? <Copy className="w-4" /> : <Check className="w-4 text-green-500" />}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <InputOTP maxLength={6} value={passcode} onChange={(value) => setPasscode(value)} autoFocus>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                    </InputOTPGroup>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                                {error && (
                                                    <div className="mt-2 text-sm text-red-600">{error}</div>
                                                )}
                                                <div className="flex items-center space-x-5 w-full">   
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full" 
                                                        onClick={() => setVerifyStep(false)}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button 
                                                        className="w-full" 
                                                        onClick={verifyTwoFactorCode}
                                                        disabled={!passcode || passcode.length < 6}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {confirmed && (
                        <div className="flex flex-col space-y-5">
                            <div className="relative">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                    Enabled
                                </Badge>
                            </div>
                            <p className="text-stone-500 dark:text-stone-400">
                                With two factor authentication enabled, you'll be prompted for a secure, random token during login, which you can retrieve from your Google Authenticator app.
                            </p>

                            <div>
                                <div className="flex items-start p-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-t-xl">
                                    <LockKeyhole className="size-5 mr-2 text-stone-500" />
                                    <div className="space-y-1">
                                        <h3 className="font-medium">2FA Recovery Codes</h3>
                                        <p className="text-sm text-stone-500 dark:text-stone-400">
                                            Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-stone-100 dark:bg-stone-800 rounded-b-xl border-t-0 border border-stone-200 dark:border-stone-700 text-sm">
                                    <div
                                        onClick={() => setShowingRecoveryCodes(!showingRecoveryCodes)}
                                        className="h-10 group cursor-pointer flex items-center select-none justify-between px-5 text-xs"
                                    >
                                        <div className={`relative ${!showingRecoveryCodes ? 'opacity-40 hover:opacity-60' : 'opacity-60'}`}>
                                            {!showingRecoveryCodes ? (
                                                <span className="flex items-center space-x-1">
                                                    <Eye className="size-4" /> <span>View My Recovery Codes</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center space-x-1">
                                                    <EyeOff className="size-4" /> <span>Hide Recovery Codes</span>
                                                </span>
                                            )}
                                        </div>
                                        {showingRecoveryCodes && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-stone-600"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    regenerateRecoveryCodes();
                                                }}
                                            >
                                                Regenerate Codes
                                            </Button>
                                        )}
                                    </div>
                                    <div
                                        className="relative overflow-hidden transition-all duration-300"
                                        style={{
                                            height: showingRecoveryCodes ? 'auto' : '0',
                                            opacity: showingRecoveryCodes ? 1 : 0,
                                        }}
                                    >
                                        <div className="grid max-w-xl gap-1 px-4 py-4 font-mono text-sm bg-stone-200 dark:bg-stone-900 dark:text-stone-100">
                                            {recoveryCodesList.map((code, index) => (
                                                <div key={index}>{code}</div>
                                            ))}
                                        </div>
                                        <p className="px-4 py-3 text-xs select-none text-stone-500 dark:text-stone-400">
                                            You have {recoveryCodesList.length} recovery codes left. Each can be used once to access your account and will be removed after use. If you need more, click <span className="font-bold">Regenerate Codes</span> above.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="inline relative">
                                <Button
                                    variant="destructive"
                                    onClick={disableTwoFactorAuthentication}
                                >
                                    Disable 2FA
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
