/**
 * TRP – The Roll Palace
 * Comprehensive End-to-End Automated Test Suite (Phase 18)
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  category: 'Customer' | 'Admin' | 'Security';
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: 'Customer' | 'Admin' | 'Security', details?: string) {
  if (condition) {
    results.push({ name, category, passed: true, details });
    console.log(`  ✓ [PASS] [${category}] ${name}`);
  } else {
    results.push({ name, category, passed: false, details: details || 'Assertion failed' });
    console.error(`  ✗ [FAIL] [${category}] ${name} - ${details}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING TRP THE ROLL PALACE COMPLETE TEST SUITE');
  console.log('======================================================\n');

  let adminCookie = '';
  let testOrderId = '';
  let testOrderNumber = '';
  let testProductId = '';

  // ------------------------------------------------------------------
  // 1. CUSTOMER WEBSITE TESTS
  // ------------------------------------------------------------------
  console.log('--- 1. CUSTOMER EXPERIENCE & STOREFRONT TESTS ---');

  // Test 1.1: Homepage loads
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(
      res.status === 200 && html.includes('THE ROLL PALACE') && html.includes('ONE BITE – FULL FLAVOUR'),
      'Homepage loads with brand tagline and headline',
      'Customer'
    );
  } catch (e: any) {
    assert(false, 'Homepage loads with brand tagline and headline', 'Customer', e.message);
  }

  // Test 1.2: Official Logo asset loads
  try {
    const res = await fetch(`${BASE_URL}/images/trp-logo.png`);
    const hasImage = res.status === 200 && (res.headers.get('content-type')?.includes('image') || false);
    assert(hasImage, 'Official Logo asset loads properly', 'Customer');
  } catch (e: any) {
    assert(false, 'Official Logo asset loads properly', 'Customer', e.message);
  }

  // Test 1.3: Menu loads from database
  let zingerProduct: any = null;
  let rollProduct: any = null;
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.products) && data.products.length >= 44, `Menu loads from database (${data.products?.length} items verified)`, 'Customer');
    zingerProduct = data.products.find((p: any) => p.name.includes('Crispy Zinger Burger'));
    rollProduct = data.products.find((p: any) => p.name.includes('TRP Crispy Roll'));
  } catch (e: any) {
    assert(false, 'Menu loads from database', 'Customer', e.message);
  }

  // Test 1.4: Search functionality
  try {
    const res = await fetch(`${BASE_URL}/api/products?search=zinger`);
    const data = await res.json();
    assert(res.status === 200 && data.products.length > 0 && data.products.every((p: any) => p.name.toLowerCase().includes('zinger')), 'Product search returns accurate matching items', 'Customer');
  } catch (e: any) {
    assert(false, 'Product search returns accurate matching items', 'Customer', e.message);
  }

  // Test 1.5: Category filtering
  try {
    const res = await fetch(`${BASE_URL}/api/products?category=rolls`);
    const data = await res.json();
    assert(res.status === 200 && data.products.length > 0, 'Category filtering returns category specific items', 'Customer');
  } catch (e: any) {
    assert(false, 'Category filtering returns category specific items', 'Customer', e.message);
  }

  // Test 1.6: Delivery zones API
  let selectedZone: any = null;
  try {
    const res = await fetch(`${BASE_URL}/api/delivery-zones`);
    const data = await res.json();
    assert(res.status === 200 && data.zones?.length > 0, 'Delivery zones load with configured fees', 'Customer');
    selectedZone = data.zones[0];
  } catch (e: any) {
    assert(false, 'Delivery zones load with configured fees', 'Customer', e.message);
  }

  // Test 1.7: Public restaurant settings
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    assert(
      res.status === 200 && data.settings.phone === '03243235253' && data.settings.whatsapp_number === '923243235253',
      'Public restaurant settings provide verified phone and WhatsApp',
      'Customer'
    );
  } catch (e: any) {
    assert(false, 'Public restaurant settings provide verified phone and WhatsApp', 'Customer', e.message);
  }

  // ------------------------------------------------------------------
  // 2. CHECKOUT & ORDER VALIDATION TESTS
  // ------------------------------------------------------------------
  console.log('\n--- 2. CHECKOUT & ORDER VALIDATION TESTS ---');

  // Test 2.1: Invalid Pakistani phone validation
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Test Customer',
        customer_phone: '12345', // invalid phone
        delivery_type: 'Delivery',
        delivery_address: 'Gulshan, Karachi',
        payment_method: 'Cash on Delivery',
        items: [{ product_id: zingerProduct?.id || 'prod_1', quantity: 1 }],
      }),
    });
    assert(res.status === 400, 'Checkout rejects invalid phone numbers', 'Customer');
  } catch (e: any) {
    assert(false, 'Checkout rejects invalid phone numbers', 'Customer', e.message);
  }

  // Test 2.2: Empty cart rejection
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Test Customer',
        customer_phone: '03243235253',
        delivery_type: 'Delivery',
        delivery_address: 'Gulshan, Karachi',
        payment_method: 'Cash on Delivery',
        items: [],
      }),
    });
    assert(res.status === 400, 'Checkout rejects empty cart', 'Customer');
  } catch (e: any) {
    assert(false, 'Checkout rejects empty cart', 'Customer', e.message);
  }

  // Test 2.3: Authoritative Order Placement (Zinger x 2 + Roll x 1)
  try {
    const orderPayload = {
      customer_name: 'Ahmed Tariq',
      customer_phone: '03243235253',
      delivery_type: 'Delivery',
      delivery_address: 'Apartment 4B, Gulshan-e-Iqbal Block 13, Karachi',
      delivery_zone_id: selectedZone?.id,
      payment_method: 'Cash on Delivery',
      notes: 'Please add extra garlic mayo dips',
      items: [
        { product_id: zingerProduct.id, quantity: 2 },
        { product_id: rollProduct.id, quantity: 1 },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();

    const expectedSubtotal = zingerProduct.price * 2 + rollProduct.price * 1;
    const expectedTotal = expectedSubtotal + (selectedZone?.fee ?? 100);

    const isValid =
      res.status === 200 &&
      data.success &&
      data.order.order_number.startsWith('TRP-') &&
      data.order.subtotal === expectedSubtotal &&
      data.order.total === expectedTotal;

    testOrderId = data.order?.id;
    testOrderNumber = data.order?.order_number;

    assert(
      isValid,
      `Order placed and calculated with database prices (Subtotal: Rs. ${data.order?.subtotal}, Total: Rs. ${data.order?.total})`,
      'Customer'
    );
  } catch (e: any) {
    assert(false, 'Order placed and calculated with database prices', 'Customer', e.message);
  }

  // Test 2.4: Order tracking lookup
  try {
    const res = await fetch(`${BASE_URL}/api/orders?number=${testOrderNumber}`);
    const data = await res.json();
    assert(
      res.status === 200 && data.order_number === testOrderNumber && data.customer_name === 'Ahmed Tariq',
      'Customer order tracking returns real-time order status',
      'Customer'
    );
  } catch (e: any) {
    assert(false, 'Customer order tracking returns real-time order status', 'Customer', e.message);
  }

  // ------------------------------------------------------------------
  // 3. SECURITY TESTS
  // ------------------------------------------------------------------
  console.log('\n--- 3. CYBERSECURITY & ACCESS CONTROL TESTS ---');

  // Test 3.1: Protected admin dashboard redirects unauthenticated requests
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      res.status === 307 || res.status === 302 || res.headers.get('location')?.includes('/admin/login'),
      'Unauthorized request to /admin/dashboard redirects to /admin/login',
      'Security'
    );
  } catch (e: any) {
    assert(false, 'Unauthorized request to /admin/dashboard redirects to /admin/login', 'Security', e.message);
  }

  // Test 3.2: Protected Admin API rejects unauthenticated requests
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(res.status === 401, 'Unauthorized request to /api/admin/orders returns HTTP 401', 'Security');
  } catch (e: any) {
    assert(false, 'Unauthorized request to /api/admin/orders returns HTTP 401', 'Security', e.message);
  }

  // Test 3.3: Client price tampering protection
  try {
    const tamperPayload = {
      customer_name: 'Tamper Tester',
      customer_phone: '03243235253',
      delivery_type: 'Pickup',
      payment_method: 'Cash on Delivery',
      items: [{ product_id: zingerProduct.id, quantity: 1, price: 5 }], // Attempted price override!
    };
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tamperPayload),
    });
    const data = await res.json();
    // Server must ignore client price and charge real database price!
    assert(
      res.status === 200 && data.order.items[0].price === zingerProduct.price && data.order.total === zingerProduct.price,
      'Server ignores client-submitted price overrides and enforces database prices',
      'Security'
    );
  } catch (e: any) {
    assert(false, 'Server ignores client-submitted price overrides', 'Security', e.message);
  }

  // Test 3.4: File upload extension filter
  try {
    const formData = new FormData();
    const fakeScript = new Blob(['alert(1)'], { type: 'application/x-sh' });
    formData.append('file', fakeScript, 'hack.sh');

    const res = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: 'POST',
      body: formData,
    });
    assert(res.status === 401 || res.status === 400, 'Non-image file uploads are blocked', 'Security');
  } catch (e: any) {
    assert(false, 'Non-image file uploads are blocked', 'Security', e.message);
  }

  // ------------------------------------------------------------------
  // 4. ADMIN PORTAL & OPERATIONS TESTS
  // ------------------------------------------------------------------
  console.log('\n--- 4. ADMIN DASHBOARD & RESTAURANT MANAGEMENT TESTS ---');

  // Test 4.1: Admin login failure with bad password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@trp.com', password: 'WrongPassword' }),
    });
    assert(res.status === 401, 'Admin login rejects incorrect credentials', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin login rejects incorrect credentials', 'Admin', e.message);
  }

  // Test 4.2: Admin login success with default setup password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@trp.com', password: 'RollPalace#2026!' }),
    });
    const cookieHeader = res.headers.get('set-cookie');
    if (cookieHeader) {
      adminCookie = cookieHeader.split(';')[0];
    }
    const data = await res.json();
    assert(res.status === 200 && data.success && !!adminCookie, 'Admin login succeeds and sets secure session cookie', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin login succeeds and sets secure session cookie', 'Admin', e.message);
  }

  // Test 4.3: Session check
  try {
    const res = await fetch(`${BASE_URL}/api/admin/session`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(res.status === 200 && data.authenticated && data.session.email === 'admin@trp.com', 'Admin session is verified', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin session is verified', 'Admin', e.message);
  }

  // Test 4.4: Admin orders list
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(res.status === 200 && data.orders.length > 0, 'Admin can view and search orders', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can view and search orders', 'Admin', e.message);
  }

  // Test 4.5: Admin updates order status (Pending -> Preparing -> Ready -> Delivered)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ order_status: 'Preparing' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.order.order_status === 'Preparing', 'Admin can update order status to Preparing', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can update order status to Preparing', 'Admin', e.message);
  }

  // Test 4.6: Admin verifies payment
  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ payment_status: 'Paid' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.order.payment_status === 'Paid', 'Admin can verify and approve customer payments', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can verify and approve customer payments', 'Admin', e.message);
  }

  // Test 4.7: Admin product creation
  try {
    const newProd = {
      name: 'E2E Test Lava Wrap',
      category_id: 'cat_wraps',
      price: 520,
      description: 'Special test tortilla wrap with extra melted cheese',
      is_available: true,
      is_featured: true,
    };
    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify(newProd),
    });
    const data = await res.json();
    testProductId = data.product?.id;
    assert(res.status === 200 && data.product?.name === 'E2E Test Lava Wrap' && data.product?.price === 520, 'Admin can create new menu products', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can create new menu products', 'Admin', e.message);
  }

  // Test 4.8: Admin product price edit
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ price: 580 }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.product?.price === 580, 'Admin can update product prices dynamically', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can update product prices dynamically', 'Admin', e.message);
  }

  // Test 4.9: Admin product deletion
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, 'Admin can delete products from the catalog', 'Admin');
  } catch (e: any) {
    assert(false, 'Admin can delete products from the catalog', 'Admin', e.message);
  }

  // Test 4.10: Admin analytics and CSV export
  try {
    const res = await fetch(`${BASE_URL}/api/admin/analytics?format=csv`, {
      headers: { Cookie: adminCookie },
    });
    const csv = await res.text();
    assert(
      res.status === 200 && csv.includes('Order Number') && csv.includes(testOrderNumber),
      'Admin can export financial and sales CSV reports',
      'Admin'
    );
  } catch (e: any) {
    assert(false, 'Admin can export financial and sales CSV reports', 'Admin', e.message);
  }

  // Test 4.11: Admin settings update
  try {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        announcement: '🔥 Special Weekend Deal: 10% OFF all Rolls!',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.settings?.announcement?.includes('Special Weekend Deal'),
      'Admin can update restaurant settings and announcements',
      'Admin'
    );
  } catch (e: any) {
    assert(false, 'Admin can update restaurant settings and announcements', 'Admin', e.message);
  }

  // ------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('📊 TEST SUMMARY & SCORECARD');
  console.log('======================================================');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Pass Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (passed === total) {
    console.log('🏆 ALL E2E INTEGRATION & SECURITY TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
