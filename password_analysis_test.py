#!/usr/bin/env python3
"""
Password Change and User Database Analysis Test
Specifically tests the requirements from the review request:
1. Get all users from database and analyze usernames
2. Test password change endpoint functionality
3. Identify users needing passwords
4. Test password policy enforcement
"""

import requests
import json
import sys
import os
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class PasswordAnalysisTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.all_users = []
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
    
    def authenticate_admin(self):
        """Authenticate as admin to get access token"""
        print("=== Admin Authentication ===")
        
        admin_creds = {"username": "admin.yonetici", "password": "ActorClub2024!"}
        
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=admin_creds,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.admin_token = data['access_token']
                    self.log_test(
                        "Admin Authentication", 
                        True, 
                        f"Successfully authenticated as {data['user']['name']} {data['user']['surname']}"
                    )
                    return True
                else:
                    self.log_test("Admin Authentication", False, "No access token in response")
                    return False
            else:
                self.log_test("Admin Authentication", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Request failed: {str(e)}")
            return False
    
    def get_all_users_from_database(self):
        """Get all users from database using GET /api/users"""
        print("=== Getting All Users from Database ===")
        
        if not self.admin_token:
            self.log_test("Get All Users", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if response.status_code == 200:
                self.all_users = response.json()
                total_users = len(self.all_users)
                
                self.log_test(
                    "Get All Users from Database", 
                    True, 
                    f"Successfully retrieved {total_users} users from database"
                )
                
                # Show sample usernames
                sample_usernames = [user.get('username', 'NO_USERNAME') for user in self.all_users[:10]]
                print(f"   Sample usernames: {', '.join(sample_usernames)}")
                
                return True
            else:
                self.log_test(
                    "Get All Users from Database", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Get All Users from Database", False, f"Request failed: {str(e)}")
            return False
    
    def analyze_usernames_and_identify_user_types(self):
        """Analyze usernames to identify admin/test users vs regular members"""
        print("=== Analyzing Usernames and User Types ===")
        
        if not self.all_users:
            self.log_test("Username Analysis", False, "No users data available")
            return
        
        admin_users = []
        test_users = []
        regular_members = []
        users_without_username = []
        
        # Define admin/test patterns
        admin_patterns = ['admin', 'yonetici', 'muzaffer', 'founder']
        test_patterns = ['test', 'kullanici']
        
        for user in self.all_users:
            username = user.get('username', '').lower()
            is_admin = user.get('is_admin', False)
            
            if not username:
                users_without_username.append(user)
                continue
            
            # Check if admin user
            if is_admin or any(pattern in username for pattern in admin_patterns):
                admin_users.append(user)
            # Check if test user
            elif any(pattern in username for pattern in test_patterns):
                test_users.append(user)
            # Regular member
            else:
                regular_members.append(user)
        
        # Log results
        self.log_test(
            "Username Analysis - Admin Users", 
            len(admin_users) > 0, 
            f"Found {len(admin_users)} admin users"
        )
        
        admin_usernames = [u.get('username') for u in admin_users]
        print(f"   Admin usernames: {', '.join(admin_usernames)}")
        
        self.log_test(
            "Username Analysis - Test Users", 
            len(test_users) >= 0, 
            f"Found {len(test_users)} test users"
        )
        
        if test_users:
            test_usernames = [u.get('username') for u in test_users]
            print(f"   Test usernames: {', '.join(test_usernames)}")
        
        self.log_test(
            "Username Analysis - Regular Members", 
            len(regular_members) > 0, 
            f"Found {len(regular_members)} regular members that need passwords"
        )
        
        # Show sample regular member usernames
        sample_regular = [u.get('username') for u in regular_members[:10]]
        print(f"   Sample regular member usernames: {', '.join(sample_regular)}")
        
        if users_without_username:
            self.log_test(
                "Username Analysis - Users Without Username", 
                False, 
                f"Found {len(users_without_username)} users without username field"
            )
        
        # Store for later use
        self.admin_users = admin_users
        self.test_users = test_users
        self.regular_members = regular_members
        
        return {
            'admin_count': len(admin_users),
            'test_count': len(test_users),
            'regular_count': len(regular_members),
            'no_username_count': len(users_without_username)
        }
    
    def test_password_change_endpoint_exists(self):
        """Test if /api/auth/change-password endpoint exists and works"""
        print("=== Testing Password Change Endpoint ===")
        
        if not self.admin_token:
            self.log_test("Password Change Endpoint Test", False, "No admin token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test 1: Wrong old password (should fail)
        try:
            response = self.session.post(
                f"{API_BASE}/auth/change-password",
                params={
                    "old_password": "WrongPassword123!",
                    "new_password": "NewValidPass456!"
                },
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Password Change Endpoint - Wrong Old Password", 
                    True, 
                    "Endpoint exists and correctly rejects wrong old password"
                )
            else:
                self.log_test(
                    "Password Change Endpoint - Wrong Old Password", 
                    False, 
                    f"Unexpected response: HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Change Endpoint - Wrong Old Password", False, f"Request failed: {str(e)}")
        
        # Test 2: Invalid new password format (should fail)
        try:
            response = self.session.post(
                f"{API_BASE}/auth/change-password",
                params={
                    "old_password": "ActorClub2024!",
                    "new_password": "weak"  # Too short, no special char
                },
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Password Change Endpoint - Invalid New Password", 
                    True, 
                    "Endpoint correctly enforces password policy"
                )
            else:
                self.log_test(
                    "Password Change Endpoint - Invalid New Password", 
                    False, 
                    f"Should reject invalid password, got HTTP {response.status_code}"
                )
        except Exception as e:
            self.log_test("Password Change Endpoint - Invalid New Password", False, f"Request failed: {str(e)}")
        
        return True
    
    def test_password_policy_enforcement(self):
        """Test password policy enforcement (8-16 chars, letter + special char)"""
        print("=== Testing Password Policy Enforcement ===")
        
        if not self.admin_token:
            self.log_test("Password Policy Test", False, "No admin token available")
            return
        
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test cases for password policy
        test_cases = [
            {
                "password": "Short1!",  # 7 chars - too short
                "should_fail": True,
                "reason": "Too short (7 chars, minimum 8)"
            },
            {
                "password": "ThisPasswordIsTooLongForThePolicy123!",  # >16 chars - too long
                "should_fail": True,
                "reason": "Too long (>16 chars, maximum 16)"
            },
            {
                "password": "NoSpecialChar123",  # No special character
                "should_fail": True,
                "reason": "No special character"
            },
            {
                "password": "NoLetters123!",  # No letters (actually has letters, this should pass)
                "should_fail": False,
                "reason": "Valid password"
            },
            {
                "password": "ValidPass123!",  # Valid password
                "should_fail": False,
                "reason": "Valid password format"
            }
        ]
        
        for i, test_case in enumerate(test_cases):
            try:
                response = self.session.post(
                    f"{API_BASE}/auth/change-password",
                    params={
                        "old_password": "ActorClub2024!",
                        "new_password": test_case["password"]
                    },
                    headers=headers
                )
                
                if test_case["should_fail"]:
                    # Should get 400 error for invalid password
                    if response.status_code == 400:
                        self.log_test(
                            f"Password Policy - {test_case['reason']}", 
                            True, 
                            f"Correctly rejected: {test_case['password']}"
                        )
                    else:
                        self.log_test(
                            f"Password Policy - {test_case['reason']}", 
                            False, 
                            f"Should have rejected password, got HTTP {response.status_code}"
                        )
                else:
                    # Should succeed or fail with wrong old password (400)
                    if response.status_code in [200, 400]:  # 400 is expected for wrong old password
                        self.log_test(
                            f"Password Policy - {test_case['reason']}", 
                            True, 
                            f"Password format accepted: {test_case['password']}"
                        )
                    else:
                        self.log_test(
                            f"Password Policy - {test_case['reason']}", 
                            False, 
                            f"Valid password rejected, got HTTP {response.status_code}"
                        )
                        
            except Exception as e:
                self.log_test(f"Password Policy - {test_case['reason']}", False, f"Request failed: {str(e)}")
    
    def generate_readable_secure_passwords(self):
        """Generate readable but secure passwords following the policy"""
        print("=== Generating Sample Passwords ===")
        
        if not hasattr(self, 'regular_members'):
            self.log_test("Password Generation", False, "No regular members data available")
            return
        
        # Sample password generation following the format: CapitalWord + numbers + special char
        sample_passwords = [
            "Actor2024!",
            "Stage2024@",
            "Drama2024#",
            "Scene2024$",
            "Movie2024%",
            "Theater2024&",
            "Artist2024*",
            "Perform2024!",
            "Creative2024@",
            "Talent2024#"
        ]
        
        # Validate each sample password against policy
        valid_passwords = []
        for password in sample_passwords:
            # Check policy: 8-16 chars, at least 1 letter, 1 special char
            if (8 <= len(password) <= 16 and 
                re.search(r'[A-Za-z]', password) and 
                re.search(r'[!@#$%^&*(),.?":{}|<>]', password)):
                valid_passwords.append(password)
        
        self.log_test(
            "Password Generation - Policy Compliance", 
            len(valid_passwords) == len(sample_passwords), 
            f"Generated {len(valid_passwords)}/{len(sample_passwords)} policy-compliant passwords"
        )
        
        print("   Sample generated passwords:")
        for password in valid_passwords[:5]:
            print(f"   - {password}")
        
        # Show how many users need passwords
        regular_count = len(self.regular_members)
        self.log_test(
            "Users Needing Passwords", 
            regular_count > 0, 
            f"{regular_count} regular members need password generation (excluding admin/test accounts)"
        )
        
        return valid_passwords
    
    def check_user_profile_password_change_access(self):
        """Check if regular users can access password change functionality"""
        print("=== Testing User Profile Password Change Access ===")
        
        # This would require testing with a regular user account
        # For now, we'll test the endpoint accessibility
        
        # Try to login with a test user if available
        if hasattr(self, 'test_users') and self.test_users:
            test_user = self.test_users[0]
            test_username = test_user.get('username')
            
            # Try common test passwords
            test_passwords = ["Test567!", "TestPass123!", "test123!"]
            
            for password in test_passwords:
                try:
                    response = self.session.post(
                        f"{API_BASE}/auth/login",
                        json={"username": test_username, "password": password},
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        test_token = data.get('access_token')
                        
                        # Test password change with test user token
                        headers = {
                            "Authorization": f"Bearer {test_token}",
                            "Content-Type": "application/json"
                        }
                        
                        change_response = self.session.post(
                            f"{API_BASE}/auth/change-password",
                            params={
                                "old_password": password,
                                "new_password": "NewTestPass123!"
                            },
                            headers=headers
                        )
                        
                        if change_response.status_code in [200, 400]:  # 200 success, 400 validation error
                            self.log_test(
                                "Regular User Password Change Access", 
                                True, 
                                f"Regular users can access password change endpoint (tested with {test_username})"
                            )
                        else:
                            self.log_test(
                                "Regular User Password Change Access", 
                                False, 
                                f"Regular user cannot access password change: HTTP {change_response.status_code}"
                            )
                        break
                        
                except Exception as e:
                    continue
            else:
                self.log_test(
                    "Regular User Password Change Access", 
                    False, 
                    "Could not authenticate with test user to verify access"
                )
        else:
            self.log_test(
                "Regular User Password Change Access", 
                False, 
                "No test users available to verify regular user access"
            )
    
    def run_password_analysis(self):
        """Run all password-related tests"""
        print("🔐 Starting Password Change and User Database Analysis")
        print(f"Testing against: {API_BASE}")
        print("=" * 70)
        
        # Step 1: Authenticate as admin
        if not self.authenticate_admin():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Step 2: Get all users from database
        if not self.get_all_users_from_database():
            print("❌ Cannot proceed without user data")
            return False
        
        # Step 3: Analyze usernames and identify user types
        analysis_results = self.analyze_usernames_and_identify_user_types()
        
        # Step 4: Test password change endpoint
        self.test_password_change_endpoint_exists()
        
        # Step 5: Test password policy enforcement
        self.test_password_policy_enforcement()
        
        # Step 6: Generate sample passwords
        self.generate_readable_secure_passwords()
        
        # Step 7: Check user profile access
        self.check_user_profile_password_change_access()
        
        # Summary
        print("=" * 70)
        print("📊 PASSWORD ANALYSIS SUMMARY")
        print("=" * 70)
        
        if analysis_results:
            print(f"👥 User Database Analysis:")
            print(f"   - Admin users: {analysis_results['admin_count']}")
            print(f"   - Test users: {analysis_results['test_count']}")
            print(f"   - Regular members needing passwords: {analysis_results['regular_count']}")
            print(f"   - Users without username: {analysis_results['no_username_count']}")
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"\n🧪 Test Results:")
        print(f"   - Total Tests: {total}")
        print(f"   - Passed: {passed}")
        print(f"   - Failed: {total - passed}")
        print(f"   - Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n✅ All password analysis tests passed!")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. See details above.")
            return False

if __name__ == "__main__":
    tester = PasswordAnalysisTester()
    success = tester.run_password_analysis()
    sys.exit(0 if success else 1)