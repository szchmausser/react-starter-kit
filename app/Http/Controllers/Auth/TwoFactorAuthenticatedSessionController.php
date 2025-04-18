<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Features;

class TwoFactorAuthenticatedSessionController extends Controller
{
    /**
     * Display the two factor authentication challenge view.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/two-factor-challenge');
    }

    /**
     * Attempt to authenticate a new session using the two factor authentication code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'nullable|string',
            'recovery_code' => 'nullable|string',
        ]);

        $userId = $request->session()->get('login.id');
        $user = \App\Models\User::find($userId);

        if (! $user) {
            return redirect()->route('login');
        }

        // Handle TOTP code
        if ($request->filled('code')) {
            $secret = decrypt($user->two_factor_secret);
            $valid = app(\App\Actions\TwoFactorAuth\VerifyTwoFactorCode::class)($secret, $request->code);
            if ($valid) {
                Auth::login($user, $request->session()->get('login.remember', false));
                $request->session()->regenerate();
                $request->session()->forget(['login.id', 'login.remember']);
                return redirect()->intended(route('dashboard', absolute: false));
            }
            return back()->withErrors(['code' => __('The provided two factor authentication code was invalid.')]);
        }

        // Handle recovery code
        if ($request->filled('recovery_code')) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
            $provided = $request->recovery_code;
            $match = collect($recoveryCodes)->first(function ($code) use ($provided) {
                return hash_equals($code, $provided);
            });
            if (! $match) {
                return back()->withErrors(['recovery_code' => __('The provided two factor authentication recovery code was invalid.')]);
            }
            // Remove used recovery code using the ProcessRecoveryCode action
            $updatedCodes = app(\App\Actions\TwoFactorAuth\ProcessRecoveryCode::class)($recoveryCodes, $match);
            if ($updatedCodes === false) {
                return back()->withErrors(['recovery_code' => __('The provided two factor authentication recovery code was invalid.')]);
            }
            $user->two_factor_recovery_codes = encrypt(json_encode($updatedCodes));
            $user->save();
            Auth::login($user, $request->session()->get('login.remember', false));
            $request->session()->regenerate();
            $request->session()->forget(['login.id', 'login.remember']);
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return back()->withErrors(['code' => __('Please provide a valid two factor authentication code.')]);
    }
}
