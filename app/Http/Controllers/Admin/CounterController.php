<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Http\Requests\CounterRequest;
use Inertia\Inertia;

class CounterController extends Controller
{
    public function index()
    {
        $counters = Counter::orderBy('sort_order')->get();
        return Inertia::render('Admin/Counters/Index', [
            'counters' => $counters
        ]);
    }

    public function store(CounterRequest $request)
    {
        Counter::create($request->validated());
        return redirect()->route('admin.counters.index')->with('success', 'Counter created.');
    }

    public function update(CounterRequest $request, Counter $counter)
    {
        $counter->update($request->validated());
        return redirect()->route('admin.counters.index')->with('success', 'Counter updated.');
    }

    public function destroy(Counter $counter)
    {
        $counter->delete();
        return redirect()->route('admin.counters.index')->with('success', 'Counter deleted.');
    }
}
