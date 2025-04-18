import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function TwoFactorChallenge() {
    const [activeTab, setActiveTab] = useState('code');

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submitCode = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('two-factor.challenge'));
    };

    const submitRecoveryCode = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('two-factor.challenge'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Head title="Two Factor Authentication" />

            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Two Factor Authentication</CardTitle>
                        <CardDescription>
                            Confirm access to your account by entering the authentication code provided by your authenticator application or one of your recovery codes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="code">Code</TabsTrigger>
                                <TabsTrigger value="recovery">Recovery Code</TabsTrigger>
                            </TabsList>
                            <TabsContent value="code">
                                <form onSubmit={submitCode} className="space-y-4 pt-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="code">Authentication Code</Label>
                                        <InputOTP 
                                            maxLength={6} 
                                            value={data.code} 
                                            onChange={(value) => setData('code', value)}
                                        >
                                            <InputOTPGroup>
                                                {Array.from({ length: 6 }).map((_, index) => (
                                                    <InputOTPSlot key={index} index={index} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <InputError message={errors.code} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        Verify
                                    </Button>
                                </form>
                            </TabsContent>
                            <TabsContent value="recovery">
                                <form onSubmit={submitRecoveryCode} className="space-y-4 pt-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="recovery_code">Recovery Code</Label>
                                        <Input
                                            id="recovery_code"
                                            type="text"
                                            value={data.recovery_code}
                                            onChange={(e) => setData('recovery_code', e.target.value)}
                                            className="block w-full"
                                            autoComplete="one-time-code"
                                            placeholder="Enter recovery code"
                                        />
                                        <InputError message={errors.recovery_code} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        Verify
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Lost your device? Please contact your administrator.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
