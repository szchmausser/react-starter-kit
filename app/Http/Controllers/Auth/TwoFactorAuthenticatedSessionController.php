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
        if (! $request->session()->has('auth.two_factor_user_id')) {
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

        $user = Auth::loginUsingId($request->session()->pull('auth.two_factor_user_id'));

        if ($request->filled('code')) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->session()->pull('auth.two_factor_remember'),
            ]);

            $result = app(ConfirmTwoFactorAuthentication::class)(
                $request->user(),
                $request->code
            );

            if ($result) {
                $request->session()->forget('login');
                return redirect()->intended(route('dashboard'));
            }

            return back()->withErrors(['code' => __('The provided two factor authentication code was invalid.')]);
        }

        if ($request->filled('recovery_code')) {
            $recovery = collect($user->recoveryCodes())->first(function ($code) use ($request) {
                return hash_equals($code, $request->recovery_code);
            });

            if (! $recovery) {
                return back()->withErrors(['recovery_code' => __('The provided two factor authentication recovery code was invalid.')]);
            }

            $user->replaceRecoveryCode($recovery);

            $request->session()->forget('login');

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors(['code' => __('Please provide a valid two factor authentication code.')]);
    }
}
