<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PurchaseController extends Controller
{
    /**
     * Initiate purchase - Check balance and return purchase preview.
     */
    public function initiate(string $slug): JsonResponse
    {
        $user = Auth::user();

        // Find product by slug
        $product = Product::where('slug', $slug)->firstOrFail();

        // Get user balance (in smallest unit - cents)
        $userBalance = $user->balanceInt;

        // Get product price (in smallest unit - cents)
        $productPrice = $product->getAmountProduct($user);

        // Check if user can purchase
        $canPurchase = $userBalance >= $productPrice;

        $response = [
            'can_purchase' => $canPurchase,
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $productPrice / 100, // Convert to main unit
                'formattedPrice' => number_format($productPrice / 100, 2) . ' ₽',
            ],
            'user_balance' => $userBalance / 100, // Convert to main unit
            'formatted_balance' => number_format($userBalance / 100, 2) . ' ₽',
        ];

        if ($canPurchase) {
            $remainingBalance = $userBalance - $productPrice;
            $response['remaining_balance'] = $remainingBalance / 100;
            $response['formattedRemainingBalance'] = number_format($remainingBalance / 100, 2) . ' ₽';
        } else {
            $shortfall = $productPrice - $userBalance;
            $response['shortfall'] = $shortfall / 100;
            $response['formattedShortfall'] = number_format($shortfall / 100, 2) . ' ₽';
        }

        return response()->json($response);
    }

    /**
     * Confirm purchase - Execute payment and create purchase record.
     */
    public function confirm(string $slug): JsonResponse
    {
        $user = Auth::user();

        // Find product by slug
        $product = Product::where('slug', $slug)->firstOrFail();

        try {
            DB::beginTransaction();

            // Check if product prevents re-purchase and user already owns it
            if ($product->prevent_repurchase && $user->hasPurchased($product)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'error' => 'You already own this product and it cannot be purchased again.',
                    'error_code' => 'already_purchased',
                ], 400);
            }

            // Check balance again within transaction
            $userBalance = $user->balanceInt;
            $productPrice = $product->getAmountProduct($user);

            if ($userBalance < $productPrice) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'error' => 'Insufficient balance to complete purchase.',
                    'error_code' => 'insufficient_balance',
                ], 400);
            }

            // Execute wallet payment with product description
            // Use withdraw instead of pay since we just need to deduct from user's wallet
            // We're not transferring to the product's wallet
            $transaction = $user->withdraw($productPrice, [
                'description' => 'Покупка: ' . $product->name,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'purchase_type' => 'product_purchase',
            ]);

            // Create purchase record
            $purchaseData = [
                'purchase_price' => $productPrice / 100, // Store in main unit
                'purchased_at' => now(),
                'transaction_id' => $transaction->id,
            ];

            $user->purchasedProducts()->attach($product->id, $purchaseData);

            DB::commit();

            // Get the purchase record for response
            $purchase = $user->purchasedProducts()
                ->where('product_id', $product->id)
                ->orderBy('product_user.purchased_at', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Purchase completed successfully!',
                'purchase' => [
                    'id' => $purchase->pivot->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price_paid' => $purchase->pivot->purchase_price,
                    'purchased_at' => $purchase->pivot->purchased_at,
                ],
                'new_balance' => $user->balanceInt / 100,
                'formatted_balance' => number_format($user->balanceInt / 100, 2) . ' ₽',
                'transaction_uuid' => $transaction->uuid,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Purchase failed', [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Purchase could not be completed. Please try again.',
                'error_code' => 'purchase_failed',
            ], 500);
        }
    }

    /**
     * Get user's purchase history.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $perPage = min($request->input('per_page', 15), 50);
        $sort = $request->input('sort', 'recent');

        $query = $user->purchasedProducts()
            ->with(['subcategory.mainCategory', 'media']);

        // Apply sorting
        switch ($sort) {
            case 'oldest':
                $query->orderBy('product_user.purchased_at', 'asc');
                break;
            case 'name':
                $query->orderBy('products.name', 'asc');
                break;
            case 'recent':
            default:
                $query->orderBy('product_user.purchased_at', 'desc');
                break;
        }

        $purchases = $query->paginate($perPage);

        $data = $purchases->map(function ($product) {
            try {
                $image = $product->getFirstMedia('product_images');

                // Safely get category and subcategory names
                $categoryName = '';
                $subcategoryName = '';

                if ($product->subcategory) {
                    $subcategoryName = $product->subcategory->name;
                    if ($product->subcategory->mainCategory) {
                        $categoryName = $product->subcategory->mainCategory->name;
                    }
                }

                // Format the purchased_at date
                $purchasedAt = $product->pivot->purchased_at;
                $formattedDate = is_string($purchasedAt)
                    ? \Carbon\Carbon::parse($purchasedAt)->format('d.m.Y')
                    : $purchasedAt->format('d.m.Y');

                return [
                    'id' => $product->pivot->id,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'category' => $categoryName,
                        'subcategory' => $subcategoryName,
                        'image_url' => $image ? $image->getUrl() : null,
                    ],
                    'purchase_price' => $product->pivot->purchase_price,
                    'formatted_price' => number_format($product->pivot->purchase_price, 2) . ' ₽',
                    'purchased_at' => is_string($purchasedAt) ? $purchasedAt : $purchasedAt->toISOString(),
                    'formatted_date' => $formattedDate,
                    'can_download' => true,
                ];
            } catch (\Exception $e) {
                Log::error('Error formatting purchase data', [
                    'product_id' => $product->id ?? null,
                    'error' => $e->getMessage(),
                ]);
                return null;
            }
        })->filter(); // Remove null values

        return response()->json([
            'data' => $data->values(), // Re-index array after filtering
            'meta' => [
                'current_page' => $purchases->currentPage(),
                'last_page' => $purchases->lastPage(),
                'per_page' => $purchases->perPage(),
                'total' => $purchases->total(),
            ],
        ]);
    }

    /**
     * Download purchased product.
     */
    public function download(int $purchaseId)
    {
        $user = Auth::user();

        // Find the purchase and verify ownership
        $purchase = DB::table('product_user')
            ->where('id', $purchaseId)
            ->where('user_id', $user->id)
            ->first();

        if (!$purchase) {
            abort(404, 'Purchase not found.');
        }

        $product = Product::findOrFail($purchase->product_id);

        // Get latest version
        $latestVersion = $product->latestVersion()->first();

        if (!$latestVersion) {
            abort(404, 'No product version available for download.');
        }

        $archive = $latestVersion->getArchiveFile();

        if (!$archive) {
            abort(404, 'Product file not found.');
        }

        // Increment download counts
        $latestVersion->incrementDownloadCount();

        // Return file download
        return response()->download(
            $archive->getPath(),
            $archive->file_name
        );
    }
}
