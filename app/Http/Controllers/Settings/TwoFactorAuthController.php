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
    public function show(Request $request)
    {
        $user = $request->user();
        $confirmed = !is_null($user->two_factor_confirmed_at);
        
        return Inertia::render('settings/two-factor', [
            'confirmed' => $confirmed,
            'recoveryCodes' => $this->getRecoveryCodes($user),
        ]);
    }

    /**
     * Enable two factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function enable(Request $request)
    {
        [$qrCode, $secret] = app(GenerateQrCodeAndSecretKey::class)($request->user());
        
        $recoveryCodes = $this->generateRecoveryCodes($request->user());
        
        $request->user()->forceFill([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes))
        ])->save();

        return response()->json([
            'status' => 'two-factor-authentication-enabled',
            'svg' => $qrCode,
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes
        ]);
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
            'code' => 'required|string',
        ]);

        // Get the secret key from the user's record
        $secret = decrypt($request->user()->two_factor_secret);
        
        // Verify the code
        $valid = app(VerifyTwoFactorCode::class)($secret, $request->code);

        if ($valid) {
            app(ConfirmTwoFactorAuthentication::class)($request->user());
            return back()->with('status', 'two-factor-authentication-confirmed');
        }


        return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
    }


    /**
     * Get the recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function recoveryCodes(Request $request)
    {
        if (!$this->twoFactorEnabled($request->user())) {
            return response('', 404);
        }

        return response()->json([
            'recoveryCodes' => $this->getRecoveryCodes($request->user()),
        ]);
    }

    /**
     * Helper to check if 2FA is enabled for a user.
     */
    private function twoFactorEnabled($user)
    {
        return !is_null($user->two_factor_secret);
    }

    /**
     * Helper to get recovery codes for a user, or empty array if not enabled.
     */
    private function getRecoveryCodes($user)
    {
        return $this->twoFactorEnabled($user)
            ? json_decode(decrypt($user->two_factor_recovery_codes))
            : [];
    }

    /**
     * Generate new recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $codes = app(GenerateNewRecoveryCodes::class)($request->user());
        
        $request->user()->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode($codes))
        ])->save();

        // Check if this is an AJAX request
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'status' => 'recovery-codes-generated',
                'recovery_codes' => $codes
            ]);
        }
        
        return back()->with('status', 'recovery-codes-generated');
    }
}
