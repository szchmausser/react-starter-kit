<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Searchable\Search;

final class SearchController extends Controller
{
    public function index()
    {
        return Inertia::render('Search/Index');
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        $searchResults = (new Search())
            ->registerModel(User::class, ['name', 'email'])
            //->registerModel(BlogPost::class, 'title')
            ->search($query);

        return Inertia::render('Search/Results', [
            'results' => $searchResults->groupByType(),
            'query' => $query
        ]);
    }
} 