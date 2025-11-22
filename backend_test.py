#!/usr/bin/env python3
"""
Backend API Testing for Relationship Tracker App
Tests all backend endpoints with real data scenarios
"""

import requests
import json
import base64
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

# Create a small test image in base64 format
def create_test_image_base64():
    # This is a minimal 1x1 pixel JPEG image in base64
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"

class BackendTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_results = []
        self.uploaded_photo_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_get_start_date_default(self):
        """Test GET /api/start-date returns default date"""
        try:
            response = requests.get(f"{self.api_url}/start-date", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'start_date' in data:
                    expected_date = "2025-01-25T20:30:00+03:00"
                    if data['start_date'] == expected_date:
                        self.log_result("GET /api/start-date (default)", True, 
                                      f"Returns correct default date: {data['start_date']}")
                    else:
                        self.log_result("GET /api/start-date (default)", False, 
                                      f"Wrong default date. Expected: {expected_date}, Got: {data['start_date']}")
                else:
                    self.log_result("GET /api/start-date (default)", False, 
                                  "Response missing 'start_date' field", data)
            else:
                self.log_result("GET /api/start-date (default)", False, 
                              f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("GET /api/start-date (default)", False, f"Request failed: {str(e)}")

    def test_post_start_date(self):
        """Test POST /api/start-date updates the date"""
        try:
            new_date = "2025-01-26T15:45:00+03:00"
            payload = {"start_date": new_date}
            
            response = requests.post(f"{self.api_url}/start-date", 
                                   json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('start_date') == new_date:
                    # Verify the date was actually updated by getting it again
                    get_response = requests.get(f"{self.api_url}/start-date", timeout=10)
                    if get_response.status_code == 200:
                        get_data = get_response.json()
                        if get_data.get('start_date') == new_date:
                            self.log_result("POST /api/start-date", True, 
                                          f"Successfully updated start date to: {new_date}")
                        else:
                            self.log_result("POST /api/start-date", False, 
                                          f"Date not persisted. Expected: {new_date}, Got: {get_data.get('start_date')}")
                    else:
                        self.log_result("POST /api/start-date", False, 
                                      f"Failed to verify update. GET returned HTTP {get_response.status_code}")
                else:
                    self.log_result("POST /api/start-date", False, 
                                  f"Wrong response. Expected: {new_date}, Got: {data.get('start_date')}")
            else:
                self.log_result("POST /api/start-date", False, 
                              f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("POST /api/start-date", False, f"Request failed: {str(e)}")

    def test_post_photos(self):
        """Test POST /api/photos uploads a photo"""
        try:
            test_image = create_test_image_base64()
            payload = {"image_base64": test_image}
            
            response = requests.post(f"{self.api_url}/photos", 
                                   json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'image_base64', 'uploaded_at']
                
                if all(field in data for field in required_fields):
                    # Store the photo ID for later deletion test
                    self.uploaded_photo_id = data['id']
                    
                    # Verify the image data matches
                    if data['image_base64'] == test_image:
                        # Verify uploaded_at is a valid datetime
                        try:
                            datetime.fromisoformat(data['uploaded_at'].replace('Z', '+00:00'))
                            self.log_result("POST /api/photos", True, 
                                          f"Successfully uploaded photo with ID: {data['id']}")
                        except ValueError:
                            self.log_result("POST /api/photos", False, 
                                          f"Invalid uploaded_at format: {data['uploaded_at']}")
                    else:
                        self.log_result("POST /api/photos", False, 
                                      "Uploaded image data doesn't match input")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("POST /api/photos", False, 
                                  f"Missing required fields: {missing}", data)
            else:
                self.log_result("POST /api/photos", False, 
                              f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("POST /api/photos", False, f"Request failed: {str(e)}")

    def test_get_photos(self):
        """Test GET /api/photos returns all photos"""
        try:
            response = requests.get(f"{self.api_url}/photos", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if photos have required fields
                        photo = data[0]
                        required_fields = ['id', 'image_base64', 'uploaded_at']
                        
                        if all(field in photo for field in required_fields):
                            # Check if sorted by upload date (newest first)
                            if len(data) > 1:
                                dates = [datetime.fromisoformat(p['uploaded_at'].replace('Z', '+00:00')) for p in data]
                                is_sorted = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
                                sort_msg = "correctly sorted by date (newest first)" if is_sorted else "NOT sorted correctly"
                            else:
                                sort_msg = "single photo returned"
                                
                            self.log_result("GET /api/photos", True, 
                                          f"Returns {len(data)} photo(s), {sort_msg}")
                        else:
                            missing = [f for f in required_fields if f not in photo]
                            self.log_result("GET /api/photos", False, 
                                          f"Photos missing required fields: {missing}")
                    else:
                        self.log_result("GET /api/photos", True, "Returns empty array (no photos uploaded)")
                else:
                    self.log_result("GET /api/photos", False, 
                                  f"Expected array, got: {type(data)}", data)
            else:
                self.log_result("GET /api/photos", False, 
                              f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("GET /api/photos", False, f"Request failed: {str(e)}")

    def test_delete_photo(self):
        """Test DELETE /api/photos/{photo_id}"""
        if not self.uploaded_photo_id:
            self.log_result("DELETE /api/photos/{id}", False, 
                          "No photo ID available (upload test may have failed)")
            return
            
        try:
            response = requests.delete(f"{self.api_url}/photos/{self.uploaded_photo_id}", 
                                     timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    # Verify photo was actually deleted
                    get_response = requests.get(f"{self.api_url}/photos", timeout=10)
                    if get_response.status_code == 200:
                        photos = get_response.json()
                        photo_ids = [p['id'] for p in photos]
                        
                        if self.uploaded_photo_id not in photo_ids:
                            self.log_result("DELETE /api/photos/{id}", True, 
                                          f"Successfully deleted photo {self.uploaded_photo_id}")
                        else:
                            self.log_result("DELETE /api/photos/{id}", False, 
                                          "Photo still exists after deletion")
                    else:
                        self.log_result("DELETE /api/photos/{id}", False, 
                                      f"Failed to verify deletion. GET returned HTTP {get_response.status_code}")
                else:
                    self.log_result("DELETE /api/photos/{id}", False, 
                                  "Response missing 'message' field", data)
            else:
                self.log_result("DELETE /api/photos/{id}", False, 
                              f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("DELETE /api/photos/{id}", False, f"Request failed: {str(e)}")

    def test_delete_nonexistent_photo(self):
        """Test DELETE /api/photos/{photo_id} with non-existent ID"""
        try:
            fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
            response = requests.delete(f"{self.api_url}/photos/{fake_id}", timeout=10)
            
            if response.status_code == 404:
                self.log_result("DELETE /api/photos/{invalid_id}", True, 
                              "Correctly returns 404 for non-existent photo")
            else:
                self.log_result("DELETE /api/photos/{invalid_id}", False, 
                              f"Expected HTTP 404, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("DELETE /api/photos/{invalid_id}", False, f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("RELATIONSHIP TRACKER - BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing backend at: {self.api_url}")
        print()
        
        # Test in logical order
        self.test_get_start_date_default()
        self.test_post_start_date()
        self.test_post_photos()
        self.test_get_photos()
        self.test_delete_photo()
        self.test_delete_nonexistent_photo()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print()
        
        if total - passed > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['message']}")
                    if result['details']:
                        print(f"     Details: {result['details']}")
            print()
        
        return passed == total

def main():
    backend_url = get_backend_url()
    
    if not backend_url:
        print("❌ ERROR: Could not find EXPO_PUBLIC_BACKEND_URL in /app/frontend/.env")
        sys.exit(1)
    
    print(f"Backend URL found: {backend_url}")
    
    tester = BackendTester(backend_url)
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()