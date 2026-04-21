<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Http\Requests\NewsRequest;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        $news = News::orderByDesc('published_date')->get();
        return Inertia::render('Admin/News/Index', [
            'news' => $news
        ]);
    }

    public function store(NewsRequest $request)
    {
        News::create($request->validated());
        return redirect()->route('admin.news.index')->with('success', 'News created.');
    }

    public function update(NewsRequest $request, News $news)
    {
        $news->update($request->validated());
        return redirect()->route('admin.news.index')->with('success', 'News updated.');
    }

    public function destroy(News $news)
    {
        $news->delete();
        return redirect()->route('admin.news.index')->with('success', 'News deleted.');
    }
}

