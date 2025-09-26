#!/usr/bin/env python3
"""
Admin User Creation Focused Test
Tests the specific admin user creation functionality reported as not working
"""

import requests
import json
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class AdminUserCreationTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
    
    def test_admin_login(self):
        """Test admin login first as specified in review request"""
        print("=== Step 1: Testing Admin Login ===")
        
        admin_creds = {"username": "admin.yonetici", "password": "ActorClub2024!"}
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=admin_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.admin_token = data['access_token']
                    user = data['user']
                    
                    # Verify admin privileges
                    if user.get('is_admin', False):
                        self.log_test(
                            "Admin Login", 
                            True, 
                            f"Successfully logged in as admin: {user['name']} {user['surname']}"
                        )
                        return True
                    else:
                        self.log_test(
                            "Admin Login", 
                            False, 
                            "User logged in but does not have admin privileges"
                        )
                        return False
                else:
                    self.log_test(
                        "Admin Login", 
                        False, 
                        "Missing access_token or user in response",
                        response.text
                    )
                    return False
            else:
                self.log_test(
                    "Admin Login", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Admin Login", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_user_creation_endpoint(self):
        """Test user creation endpoint with admin token"""
        print("=== Step 2: Testing User Creation Endpoint ===")
        
        if not self.admin_token:
            self.log_test("User Creation Endpoint", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test user as specified in review request
        test_user = {
            "username": "test.kullanici", 
            "email": "test@example.com",
            "password": "TestPass123!",
            "name": "Test",
            "surname": "Kullanıcı"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=test_user,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "User Creation Endpoint", 
                    True, 
                    f"Successfully created user: {data['username']} ({data['name']} {data['surname']})"
                )
                return True
            elif response.status_code == 400 and "zaten kayıtlı" in response.text:
                # User already exists - this is actually OK for testing
                self.log_test(
                    "User Creation Endpoint", 
                    True, 
                    "User already exists (expected for repeated tests)"
                )
                return True
            else:
                self.log_test(
                    "User Creation Endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
        except Exception as e:
            self.log_test("User Creation Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_username_format_validation(self):
        """Test username format validation (name.surname format, lowercase)"""
        print("=== Step 3: Testing Username Format Validation ===")
        
        if not self.admin_token:
            self.log_test("Username Format Validation", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test invalid username formats
        invalid_usernames = [
            "invalidusername",  # No dot
            "Invalid.Username",  # Capital letters
            "test.user.extra",  # Too many dots
            "test.",  # Missing surname
            ".surname"  # Missing name
        ]
        
        validation_passed = 0
        
        for invalid_username in invalid_usernames:
            test_user = {
                "username": invalid_username,
                "email": f"{invalid_username.replace('.', '')}@example.com",
                "password": "TestPass123!",
                "name": "Test",
                "surname": "User"
            }
            
            try:
                response = self.session.post(
                    f"{API_BASE}/users",
                    json=test_user,
                    headers=headers
                )
                
                if response.status_code == 422:  # Validation error expected
                    validation_passed += 1
                    print(f"   ✅ Correctly rejected: {invalid_username}")
                else:
                    print(f"   ❌ Should have rejected: {invalid_username} (got HTTP {response.status_code})")
                    
            except Exception as e:
                print(f"   ❌ Error testing {invalid_username}: {str(e)}")
        
        success = validation_passed == len(invalid_usernames)
        self.log_test(
            "Username Format Validation", 
            success, 
            f"Validated {validation_passed}/{len(invalid_usernames)} invalid username formats correctly"
        )
        return success
    
    def test_password_policy_enforcement(self):
        """Test password policy enforcement (8-16 chars, letter + special char)"""
        print("=== Step 4: Testing Password Policy Enforcement ===")
        
        if not self.admin_token:
            self.log_test("Password Policy Enforcement", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test invalid passwords
        invalid_passwords = [
            "short1!",  # Too short (7 chars)
            "thispasswordistoolongtobevalid123!",  # Too long (>16 chars)
            "NoSpecialChar123",  # No special character
            "noletters123!",  # No uppercase/lowercase letters
            "OnlyLetters!",  # No numbers (this should actually be valid per the policy)
        ]
        
        validation_passed = 0
        
        for i, invalid_password in enumerate(invalid_passwords):
            test_user = {
                "username": f"test.password{i}",
                "email": f"testpassword{i}@example.com",
                "password": invalid_password,
                "name": "Test",
                "surname": f"Password{i}"
            }
            
            try:
                response = self.session.post(
                    f"{API_BASE}/users",
                    json=test_user,
                    headers=headers
                )
                
                if response.status_code == 422:  # Validation error expected
                    validation_passed += 1
                    print(f"   ✅ Correctly rejected: {invalid_password}")
                else:
                    print(f"   ❌ Should have rejected: {invalid_password} (got HTTP {response.status_code})")
                    
            except Exception as e:
                print(f"   ❌ Error testing {invalid_password}: {str(e)}")
        
        # Note: "OnlyLetters!" should actually be valid per policy (only requires letter + special char)
        expected_rejections = len(invalid_passwords) - 1  # Subtract 1 for "OnlyLetters!"
        success = validation_passed >= expected_rejections
        
        self.log_test(
            "Password Policy Enforcement", 
            success, 
            f"Validated {validation_passed}/{len(invalid_passwords)} invalid passwords correctly"
        )
        return success
    
    def test_email_uniqueness_check(self):
        """Test email uniqueness check"""
        print("=== Step 5: Testing Email Uniqueness Check ===")
        
        if not self.admin_token:
            self.log_test("Email Uniqueness Check", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Try to create user with existing admin email
        duplicate_email_user = {
            "username": "test.duplicate",
            "email": "admin1@actorclub.com",  # This should already exist for admin
            "password": "TestPass123!",
            "name": "Test",
            "surname": "Duplicate"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=duplicate_email_user,
                headers=headers
            )
            
            if response.status_code == 400 and "email zaten kayıtlı" in response.text:
                self.log_test(
                    "Email Uniqueness Check", 
                    True, 
                    "Correctly rejected duplicate email"
                )
                return True
            else:
                self.log_test(
                    "Email Uniqueness Check", 
                    False, 
                    f"Should have rejected duplicate email, got HTTP {response.status_code}: {response.text}"
                )
                return False
        except Exception as e:
            self.log_test("Email Uniqueness Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_username_uniqueness_check(self):
        """Test username uniqueness check"""
        print("=== Step 6: Testing Username Uniqueness Check ===")
        
        if not self.admin_token:
            self.log_test("Username Uniqueness Check", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Try to create user with existing admin username
        duplicate_username_user = {
            "username": "admin.yonetici",  # This should already exist
            "email": "duplicate@example.com",
            "password": "TestPass123!",
            "name": "Test",
            "surname": "Duplicate"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=duplicate_username_user,
                headers=headers
            )
            
            if response.status_code == 400 and "kullanıcı adı zaten kayıtlı" in response.text:
                self.log_test(
                    "Username Uniqueness Check", 
                    True, 
                    "Correctly rejected duplicate username"
                )
                return True
            else:
                self.log_test(
                    "Username Uniqueness Check", 
                    False, 
                    f"Should have rejected duplicate username, got HTTP {response.status_code}: {response.text}"
                )
                return False
        except Exception as e:
            self.log_test("Username Uniqueness Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_permission_verification(self):
        """Test admin permission verification"""
        print("=== Step 7: Testing Admin Permission Verification ===")
        
        # First, try to create user without admin token
        test_user = {
            "username": "test.noadmin",
            "email": "noadmin@example.com",
            "password": "TestPass123!",
            "name": "Test",
            "surname": "NoAdmin"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/users",
                json=test_user,
                headers={"Content-Type": "application/json"}  # No Authorization header
            )
            
            if response.status_code == 403:  # Forbidden expected
                self.log_test(
                    "Admin Permission Verification", 
                    True, 
                    "Correctly rejected user creation without admin token"
                )
                return True
            else:
                self.log_test(
                    "Admin Permission Verification", 
                    False, 
                    f"Should have rejected non-admin request, got HTTP {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_test("Admin Permission Verification", False, f"Request failed: {str(e)}")
            return False
    
    def verify_created_user(self):
        """Verify created user appears in GET /api/users response"""
        print("=== Step 8: Verifying Created User ===")
        
        if not self.admin_token:
            self.log_test("Created User Verification", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                
                # Look for our test user
                test_user_found = False
                for user in users:
                    if user.get('username') == 'test.kullanici':
                        test_user_found = True
                        
                        # Check if user has proper fields and is approved
                        has_proper_fields = all(field in user for field in ['name', 'surname', 'email', 'username'])
                        is_approved = user.get('is_approved', False)
                        
                        self.log_test(
                            "Created User Verification", 
                            has_proper_fields and is_approved, 
                            f"Found test user with proper fields: {has_proper_fields}, approved: {is_approved}"
                        )
                        return has_proper_fields and is_approved
                
                if not test_user_found:
                    self.log_test(
                        "Created User Verification", 
                        False, 
                        "Test user not found in users list"
                    )
                    return False
                    
            else:
                self.log_test(
                    "Created User Verification", 
                    False, 
                    f"Failed to fetch users: HTTP {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test("Created User Verification", False, f"Request failed: {str(e)}")
            return False
    
    def check_dues_creation(self):
        """Check if dues were created for the user"""
        print("=== Step 9: Checking Dues Creation ===")
        
        if not self.admin_token:
            self.log_test("Dues Creation Check", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # First get the test user ID
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                test_user_id = None
                
                for user in users:
                    if user.get('username') == 'test.kullanici':
                        test_user_id = user.get('id')
                        break
                
                if test_user_id:
                    # Check dues for this user
                    dues_response = self.session.get(f"{API_BASE}/dues/{test_user_id}", headers=headers)
                    
                    if dues_response.status_code == 200:
                        dues = dues_response.json()
                        
                        # Should have 10 months of dues
                        expected_months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
                        dues_count = len(dues)
                        
                        self.log_test(
                            "Dues Creation Check", 
                            dues_count == len(expected_months), 
                            f"Found {dues_count} dues records (expected {len(expected_months)})"
                        )
                        return dues_count == len(expected_months)
                    else:
                        self.log_test(
                            "Dues Creation Check", 
                            False, 
                            f"Failed to fetch dues: HTTP {dues_response.status_code}"
                        )
                        return False
                else:
                    self.log_test(
                        "Dues Creation Check", 
                        False, 
                        "Test user not found for dues check"
                    )
                    return False
            else:
                self.log_test(
                    "Dues Creation Check", 
                    False, 
                    f"Failed to fetch users for dues check: HTTP {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test("Dues Creation Check", False, f"Request failed: {str(e)}")
            return False
    
    def run_admin_user_creation_tests(self):
        """Run all admin user creation tests as specified in review request"""
        print("🚀 Starting Admin User Creation Focused Tests")
        print(f"Testing against: {API_BASE}")
        print("=" * 70)
        
        # Run tests in the order specified in review request
        tests_passed = 0
        total_tests = 9
        
        if self.test_admin_login():
            tests_passed += 1
        
        if self.test_user_creation_endpoint():
            tests_passed += 1
        
        if self.test_username_format_validation():
            tests_passed += 1
        
        if self.test_password_policy_enforcement():
            tests_passed += 1
        
        if self.test_email_uniqueness_check():
            tests_passed += 1
        
        if self.test_username_uniqueness_check():
            tests_passed += 1
        
        if self.test_admin_permission_verification():
            tests_passed += 1
        
        if self.verify_created_user():
            tests_passed += 1
        
        if self.check_dues_creation():
            tests_passed += 1
        
        # Summary
        print("=" * 70)
        print("📊 ADMIN USER CREATION TEST SUMMARY")
        print("=" * 70)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {tests_passed}")
        print(f"Failed: {total_tests - tests_passed}")
        print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
        
        if tests_passed == total_tests:
            print("\n🎉 All admin user creation tests passed! Feature is working correctly.")
            return True
        else:
            print(f"\n⚠️  {total_tests - tests_passed} tests failed. Admin user creation has issues.")
            return False

if __name__ == "__main__":
    tester = AdminUserCreationTester()
    success = tester.run_admin_user_creation_tests()
    sys.exit(0 if success else 1)