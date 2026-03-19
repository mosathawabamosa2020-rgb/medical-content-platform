#!/bin/bash

# Phase 6 Benchmark Reproducibility Script
# This script reproduces the performance benchmarks with cold and warm cache scenarios

set -e

echo "==================================="
echo "Phase 6 Benchmark Reproducibility"
echo "==================================="
echo ""

# Configuration
CONCURRENCY=20
REQUESTS=200
DATASET_SIZE=100000
OUTPUT_DIR="./benchmarks"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to run benchmark
run_benchmark() {
    local scenario=$1
    local cache_state=$2

    echo "Running benchmark: $scenario"
    echo "Cache state: $cache_state"
    echo ""

    # Clear cache if cold start
    if [ "$cache_state" = "cold" ]; then
        echo "Clearing database cache..."
        npx prisma db execute --stdin <<< "DISCARD ALL;"
    fi

    # Run load test
    node tools/benchmark_retrieval.js \
        --concurrency="$CONCURRENCY" \
        --requests="$REQUESTS" \
        --dataset-size="$DATASET_SIZE" \
        --output="$OUTPUT_DIR/phase6_${scenario}_results.json"

    # Generate latency breakdown
    node tools/latency_decomposition.js \
        --input="$OUTPUT_DIR/phase6_${scenario}_results.json" \
        --output="$OUTPUT_DIR/phase6_${scenario}_latency.json"

    echo "✅ Benchmark completed: $scenario"
    echo ""
}

# Run cold cache benchmark
run_benchmark "cold_cache" "cold"

# Wait for cache to warm up
echo "Waiting 30 seconds for cache warm-up..."
sleep 30

# Run warm cache benchmark
run_benchmark "warm_cache" "warm"

# Generate comparison report
node tools/compare_benchmarks.js \
    --cold="$OUTPUT_DIR/phase6_cold_cache_results.json" \
    --warm="$OUTPUT_DIR/phase6_warm_cache_results.json" \
    --output="$OUTPUT_DIR/phase6_cache_comparison.json"

echo "==================================="
echo "Benchmark Reproducibility Complete"
echo "==================================="
echo ""
echo "Results saved to: $OUTPUT_DIR/"
echo "- phase6_cold_cache_results.json"
echo "- phase6_cold_cache_latency.json"
echo "- phase6_warm_cache_results.json"
echo "- phase6_warm_cache_latency.json"
echo "- phase6_cache_comparison.json"
echo ""
echo "To view results:"
echo "cat $OUTPUT_DIR/phase6_cache_comparison.json"
