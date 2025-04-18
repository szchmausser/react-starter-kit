<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Actions\TwoFactorAuth\DisableTwoFactorAuthentication;
use App\Actions\TwoFactorAuth\GenerateNewRecoveryCodes;
use App\Actions\TwoFactorAuth\GenerateQrCodeAndSecretKey;
use App\Actions\TwoFactorAuth\ConfirmTwoFactorAuthentication;
use App\Actions\TwoFactorAuth\VerifyTwoFactorCode;

class TwoFactorAuthController extends Controller
{
    /**
     * Show the two factor authentication settings form.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function edit(Request $request)
    {
        $recoveryCodes = $request->user()->two_factor_secret ? json_decode(decrypt($request->user()->two_factor_recovery_codes)) : [];
        return Inertia::render('settings/two-factor', [
            'enabled' => !empty($request->user()->two_factor_secret),
            'qrCode' => $request->user()->two_factor_secret ? true : false,
            'recoveryCodes' => $recoveryCodes,
        ]);
    }

    /**
     * Enable two factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function enable(Request $request)
    {
        [$qrCode, $secret] = app(GenerateQrCodeAndSecretKey::class)($request->user());
        
        $request->user()->forceFill([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($this->generateRecoveryCodes($request->user())))
        ])->save();

        return back()->with('status', 'two-factor-authentication-enabled');
    }
    
    /**
     * Generate recovery codes for the user.
     *
     * @param  \App\Models\User  $user
     * @return array
     */
    private function generateRecoveryCodes($user)
    {
        return app(GenerateNewRecoveryCodes::class)($user);
    }

    /**
     * Disable two factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function disable(Request $request)
    {
        $disableTwoFactorAuthentication = app(DisableTwoFactorAuthentication::class);
        $disableTwoFactorAuthentication($request->user());

        return back()->with('status', 'two-factor-authentication-disabled');
    }

    /**
     * Verify and confirm the user's two-factor authentication.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|min:6',
        ]);

        $secret = decrypt($request->user()->two_factor_secret);
        $valid = app(VerifyTwoFactorCode::class)($secret, $request->code);

        if ($valid) {
            app(ConfirmTwoFactorAuthentication::class)($request->user());
            return back()->with('status', 'two-factor-authentication-confirmed');
        }

        return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
    }

    /**
     * Get the QR code SVG for the user's two factor authentication.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function qrCode(Request $request)
    {
        if (empty($request->user()->two_factor_secret)) {
            return response('', 404);
        }

        [$qrCode, $secret] = app(GenerateQrCodeAndSecretKey::class)($request->user());

        return response()->json([
            'svg' => $qrCode,
            'secret' => $secret
        ]);
    }

    /**
     * Get the recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function recoveryCodes(Request $request)
    {
        if (empty($request->user()->two_factor_secret)) {
            return response('', 404);
        }

        return response()->json([
            'recoveryCodes' => json_decode(decrypt($request->user()->two_factor_recovery_codes)),
        ]);
    }

    /**
     * Generate new recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $codes = app(GenerateNewRecoveryCodes::class)($request->user());
        
        $request->user()->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode($codes))
        ])->save();

        return back()->with('status', 'recovery-codes-generated');
    }
}
