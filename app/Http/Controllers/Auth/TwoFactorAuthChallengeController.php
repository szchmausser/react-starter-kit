<?php

namespace App\Http\Controllers\Auth;

use App\Actions\TwoFactorAuth\CompleteTwoFactorAuthentication;
use App\Actions\TwoFactorAuth\ProcessRecoveryCode;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class TwoFactorAuthChallengeController extends Controller
{
    /**
     * Display the two factor authentication challenge view.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        // Session check is now handled by the EnsureTwoFactorChallengeSession middleware
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

        // If we made it here, user is available via the EnsureTwoFactorChallengeSession middleware
        $user = $request->two_factor_auth_user;

        // Handle one-time password (OTP) code
        if ($request->filled('code')) {
            return $this->authenticateUsingCode($request, $user);
        }

        // Handle recovery code
        if ($request->filled('recovery_code')) {
            return $this->authenticateUsingRecoveryCode($request, $user);
        }

        return back()->withErrors(['code' => __('Please provide a valid two factor code.')]);
    }

    /**
     * Authenticate using a one-time password (OTP).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    protected function authenticateUsingCode(Request $request, User $user)
    {
        $secret = decrypt($user->two_factor_secret);
        $valid = app(\App\Actions\TwoFactorAuth\VerifyTwoFactorCode::class)($secret, $request->code);
        
        if ($valid) {
            app(CompleteTwoFactorAuthentication::class)($user);
            return redirect()->intended(route('dashboard', absolute: false));
        }
        
        return back()->withErrors(['code' => __('The provided two factor authentication code was invalid.')]);
    }

    /**
     * Authenticate using a recovery code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    protected function authenticateUsingRecoveryCode(Request $request, User $user)
    {
        $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
        $provided = $request->recovery_code;
        $match = collect($recoveryCodes)->first(function ($code) use ($provided) {
            return hash_equals($code, $provided);
        });
        
        if (! $match) {
            return back()->withErrors(['recovery_code' => __('The provided two factor authentication recovery code was invalid.')]);
        }
        
        // Remove used recovery code using the ProcessRecoveryCode action
        $updatedCodes = app(ProcessRecoveryCode::class)($recoveryCodes, $match);
        if ($updatedCodes === false) {
            return back()->withErrors(['recovery_code' => __('The provided two factor authentication recovery code was invalid.')]);
        }
        
        $user->two_factor_recovery_codes = encrypt(json_encode($updatedCodes));
        $user->save();
        
        // Complete the authentication process
        app(CompleteTwoFactorAuthentication::class)($user);
        
        // Redirect to the intended page
        return redirect()->intended(route('dashboard', absolute: false));
    }
}

