/**
 * Simple test runner for compression utilities
 * Run with: node test-compression.mjs
 */

// Import the functions directly (simulating the module)
async function deflateRaw(bytes) {
  const compressionStream = new CompressionStream('deflate-raw');
  
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
  
  const compressedStream = readableStream.pipeThrough(compressionStream);
  const reader = compressedStream.getReader();
  const chunks = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

async function inflateRaw(bytes) {
  const decompressionStream = new DecompressionStream('deflate-raw');
  
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
  
  const decompressedStream = readableStream.pipeThrough(decompressionStream);
  const reader = decompressedStream.getReader();
  const chunks = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

// Test functions
async function testCompressionRoundTrip() {
  console.log('Testing compression round-trip...');
  
  const testStrings = [
    'Hello, World!',
    'This is a longer test string with more content to compress.',
    'A'.repeat(1000),
    '{"name":"test","value":123,"nested":{"key":"value"}}',
  ];
  
  for (const testString of testStrings) {
    const encoder = new TextEncoder();
    const originalBytes = encoder.encode(testString);
    
    const compressed = await deflateRaw(originalBytes);
    console.log(`  Original: ${originalBytes.length} bytes, Compressed: ${compressed.length} bytes`);
    
    const decompressed = await inflateRaw(compressed);
    
    const decoder = new TextDecoder();
    const resultString = decoder.decode(decompressed);
    
    if (resultString === testString) {
      const preview = testString.length > 50 ? testString.substring(0, 50) + '...' : testString;
      console.log(`  ✓ Round-trip successful for: "${preview}"`);
    } else {
      console.error('  ✗ Round-trip failed!');
      return false;
    }
  }
  
  return true;
}

async function testEmptyData() {
  console.log('\nTesting empty data...');
  
  const empty = new Uint8Array(0);
  const compressed = await deflateRaw(empty);
  const decompressed = await inflateRaw(compressed);
  
  if (decompressed.length === 0) {
    console.log('  ✓ Empty data test passed');
    return true;
  } else {
    console.error('  ✗ Empty data test failed');
    return false;
  }
}

async function testLargeData() {
  console.log('\nTesting large data...');
  
  const size = 1024 * 100; // 100KB
  const largeData = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    largeData[i] = i % 256;
  }
  
  const compressed = await deflateRaw(largeData);
  const ratio = ((compressed.length / size) * 100).toFixed(2);
  console.log(`  ${size} bytes -> ${compressed.length} bytes (${ratio}% of original)`);
  
  const decompressed = await inflateRaw(compressed);
  
  if (decompressed.length === largeData.length) {
    let match = true;
    for (let i = 0; i < size; i++) {
      if (decompressed[i] !== largeData[i]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      console.log('  ✓ Large data test passed');
      return true;
    }
  }
  
  console.error('  ✗ Large data test failed');
  return false;
}

// Run all tests
async function runAllTests() {
  console.log('=== Testing share-crypto compression utilities ===\n');
  
  const results = await Promise.all([
    testCompressionRoundTrip(),
    testEmptyData(),
    testLargeData(),
  ]);
  
  const allPassed = results.every(r => r);
  
  console.log('\n=== Test Results ===');
  console.log(allPassed ? '✓ All tests passed!' : '✗ Some tests failed');
  
  process.exit(allPassed ? 0 : 1);
}

runAllTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
