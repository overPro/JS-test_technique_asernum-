#!/usr/bin/env python3
# Quick test script for microservices

import http.client
import json
import time
import sys

BASE_URL_DOCS = "localhost:3001"
BASE_URL_SHARING = "localhost:3002"

TOKEN = None
DOCUMENT_ID = None
SHARE_TOKEN = None

def test_register():
    """Test user registration"""
    global TOKEN

    print("\n  TEST 1: User Registration")
    print("-" * 50)

    try:
        conn = http.client.HTTPConnection(BASE_URL_DOCS)
        payload = json.dumps({
            "email": "testKramoh@example.com",
            "password": "password123",
            "firstname": "Test",
            "lastname": "User"
        })

        conn.request("POST", "/auth/register", payload, {
            "Content-Type": "application/json"
        })

        resp = conn.getresponse()
        data = json.loads(resp.read().decode())

        if resp.status == 201 or resp.status == 200:
            TOKEN = data.get("token")
            print(f"  Registration successful")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Token: {TOKEN[:50]}...")
            return True
        else:
            print(f"  Registration failed: {resp.status}")
            print(f"   Response: {data}")
            return False

    except Exception as e:
        print(f"  Error: {str(e)}")
        return False

def test_health_check():
    """Test API health"""
    print("\n  TEST 2: Health Check")
    print("-" * 50)

    try:
        # Test Documents API
        conn = http.client.HTTPConnection(BASE_URL_DOCS)
        conn.request("GET", "/api/docs")
        resp = conn.getresponse()

        if resp.status == 200 or resp.status == 301 or resp.status == 302:
            print(f"  Documents API responding (port 3001)")
        else:
            print(f"   Documents API returned {resp.status}")

        # Test Sharing API
        conn = http.client.HTTPConnection(BASE_URL_SHARING)
        conn.request("GET", "/api/docs")
        resp = conn.getresponse()

        if resp.status == 200 or resp.status == 301 or resp.status == 302:
            print(f"  Sharing API responding (port 3002)")
        else:
            print(f"   Sharing API returned {resp.status}")

        return True

    except Exception as e:
        print(f"  Error: {str(e)}")
        return False

def test_list_documents():
    """Test listing documents"""
    global TOKEN

    print("\n  TEST 3: List Documents")
    print("-" * 50)

    if not TOKEN:
        print("   Skipped (no token)")
        return False

    try:
        conn = http.client.HTTPConnection(BASE_URL_DOCS)
        conn.request("GET", "/documents", headers={
            "Authorization": f"Bearer {TOKEN}"
        })

        resp = conn.getresponse()
        data = json.loads(resp.read().decode())

        if resp.status == 200:
            print(f"  Documents list retrieved")
            print(f"   Total: {data.get('total', 0)} documents")
            return True
        else:
            print(f"  Failed with status {resp.status}")
            return False

    except Exception as e:
        print(f"  Error: {str(e)}")
        return False

def test_get_me():
    """Test getting current user"""
    global TOKEN

    print("\n  TEST 4: Get Current User")
    print("-" * 50)

    if not TOKEN:
        print("   Skipped (no token)")
        return False

    try:
        conn = http.client.HTTPConnection(BASE_URL_DOCS)
        conn.request("GET", "/auth/me", headers={
            "Authorization": f"Bearer {TOKEN}"
        })

        resp = conn.getresponse()
        data = json.loads(resp.read().decode())

        if resp.status == 200:
            print(f"  Current user retrieved")
            print(f"   User: {data['user']['email']}")
            return True
        else:
            print(f"   Status {resp.status}")
            return False

    except Exception as e:
        print(f"  Error: {str(e)}")
        return False

def main():
    print("\n" + "=" * 50)
    print("  MICROSERVICES QUICK TEST")
    print("=" * 50)
    print("\nNote: Make sure all 3 services are running:")
    print("  Terminal 1: documents-api on port 3001")
    print("  Terminal 2: sharing-api on port 3002")
    print("  Terminal 3: processing-worker")

    # Run tests
    results = []

    results.append(("Health Check", test_health_check()))
    time.sleep(1)

    results.append(("User Registration", test_register()))
    time.sleep(1)

    results.append(("List Documents", test_list_documents()))
    time.sleep(1)

    results.append(("Get Current User", test_get_me()))

    # Summary
    print("\n" + "=" * 50)
    print("  TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "  PASS" if result else "  FAIL"
        print(f"{status} {name}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n  All tests passed! Systems operational.")
        return 0
    else:
        print("\n   Some tests failed. Check service logs.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
