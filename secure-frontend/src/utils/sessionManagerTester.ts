/**
 * Session Management Test Utility
 * This utility helps verify that our session storage separation is working correctly
 */

import { SessionManager } from './sessionManager';

/**
 * Test scenarios for session management
 */
export class SessionManagerTester {
  
  /**
   * Test 1: Verify Supabase session handling
   */
  static async testSupabaseSession(): Promise<void> {
    console.group('🧪 Testing Supabase Session Management');
    
    try {
      // Check if session exists
      const session = await SessionManager.getSupabaseSession();
      console.log('Current Supabase session:', !!session);
      
      // Validate session
      const isValid = await SessionManager.validateSupabaseSession();
      console.log('Session validation result:', isValid);
      
      console.log('✅ Supabase session test completed');
    } catch (error) {
      console.error('❌ Supabase session test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test 2: Verify session storage (temporary cache)
   */
  static testSessionStorage(): void {
    console.group('🧪 Testing Session Storage (Temporary Cache)');
    
    try {
      // Test setting and getting session cache
      const testData = { test: 'value', timestamp: Date.now() };
      SessionManager.setSessionCache('test_key', testData);
      
      const retrieved = SessionManager.getSessionCache('test_key');
      console.log('Session cache test:', JSON.stringify(retrieved) === JSON.stringify(testData));
      
      // Test expiration
      SessionManager.setSessionCache('expire_test', 'will_expire', 100); // 100ms expiration
      setTimeout(() => {
        const expired = SessionManager.getSessionCache('expire_test');
        console.log('Expiration test (should be null):', expired);
      }, 150);
      
      // Test user role caching
      SessionManager.cacheUserRole('test-user-id', 'buyer');
      const cachedRole = SessionManager.getCachedUserRole('test-user-id');
      console.log('Role cache test:', cachedRole === 'buyer');
      
      // Test user data caching
      const testUser = { id: 'test-user', email: 'test@example.com', role: 'buyer' };
      SessionManager.cacheUserData(testUser);
      const cachedUser = SessionManager.getCachedUserData();
      console.log('User data cache test:', !!cachedUser && cachedUser.id === 'test-user');
      
      console.log('✅ Session storage test completed');
    } catch (error) {
      console.error('❌ Session storage test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test 3: Verify persistent token storage
   */
  static testPersistentStorage(): void {
    console.group('🧪 Testing Persistent Storage (localStorage)');
    
    try {
      // Test with remember me enabled
      const testToken = 'test-token-12345';
      SessionManager.setPersistentToken(testToken, { rememberMe: true });
      
      const retrievedToken = SessionManager.getPersistentToken();
      console.log('Persistent token with remember me:', retrievedToken === testToken);
      
      // Test with remember me disabled
      SessionManager.removePersistentToken();
      SessionManager.setPersistentToken(testToken, { rememberMe: false });
      
      const noTokenStored = SessionManager.getPersistentToken();
      console.log('No token stored when remember me is false:', noTokenStored === null);
      
      // Test token expiration
      SessionManager.setPersistentToken('expire-token', { 
        rememberMe: true, 
        duration: 100 // 100ms expiration 
      });
      
      setTimeout(() => {
        const expiredToken = SessionManager.getPersistentToken();
        console.log('Token expiration test (should be null):', expiredToken === null);
      }, 150);
      
      console.log('✅ Persistent storage test completed');
    } catch (error) {
      console.error('❌ Persistent storage test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test 4: Verify complete logout cleanup
   */
  static async testLogoutCleanup(): Promise<void> {
    console.group('🧪 Testing Complete Logout Cleanup');
    
    try {
      // Set up some test data in all storage types
      SessionManager.setSessionCache('test_session', 'session_data');
      SessionManager.cacheUserData({ id: 'test', email: 'test@example.com' });
      SessionManager.cacheUserRole('test-user', 'buyer');
      SessionManager.setPersistentToken('test-token', { rememberMe: true });
      
      // Add some localStorage items
      localStorage.setItem('other_item', 'should_be_cleared');
      sessionStorage.setItem('session_item', 'should_be_cleared');
      
      console.log('Before cleanup:');
      SessionManager.logStorageState();
      
      // Perform cleanup
      await SessionManager.performCompleteLogout();
      
      // Check if everything is cleared
      const sessionData = SessionManager.getSessionCache('test_session');
      const userData = SessionManager.getCachedUserData();
      const persistentToken = SessionManager.getPersistentToken();
      const otherItem = localStorage.getItem('other_item');
      const sessionItem = sessionStorage.getItem('session_item');
      
      console.log('After cleanup:');
      console.log('Session data cleared:', sessionData === null);
      console.log('User data cleared:', userData === null);
      console.log('Persistent token cleared:', persistentToken === null);
      console.log('Other localStorage cleared:', otherItem === null);
      console.log('SessionStorage cleared:', sessionItem === null);
      
      SessionManager.logStorageState();
      
      console.log('✅ Logout cleanup test completed');
    } catch (error) {
      console.error('❌ Logout cleanup test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test 5: Verify storage separation
   */
  static async testStorageSeparation(): Promise<void> {
    console.group('🧪 Testing Storage Separation');
    
    try {
      // Test that different storage types don't interfere with each other
      SessionManager.setSessionCache('same_key', 'session_value');
      SessionManager.setPersistentToken('same_key', { rememberMe: true });
      localStorage.setItem('same_key', 'local_value');
      sessionStorage.setItem('same_key', 'session_raw_value');
      
      const sessionValue = SessionManager.getSessionCache('same_key');
      const persistentValue = SessionManager.getPersistentToken();
      const localValue = localStorage.getItem('same_key');
      const sessionRawValue = sessionStorage.getItem('same_key');
      
      console.log('Session cache value:', sessionValue);
      console.log('Persistent token value:', persistentValue);
      console.log('Direct localStorage value:', localValue);
      console.log('Direct sessionStorage value:', sessionRawValue);
      
      // They should all be different, showing proper separation
      const allDifferent = sessionValue !== persistentValue && 
                          sessionValue !== localValue && 
                          persistentValue !== sessionRawValue;
      
      console.log('Storage separation working:', allDifferent);
      
      // Get current auth state
      const authState = await SessionManager.getCurrentAuthState();
      console.log('Current auth state:', authState);
      
      console.log('✅ Storage separation test completed');
    } catch (error) {
      console.error('❌ Storage separation test failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting SessionManager Tests');
    console.log('=====================================');
    
    try {
      await this.testSupabaseSession();
      this.testSessionStorage();
      this.testPersistentStorage();
      await this.testLogoutCleanup();
      await this.testStorageSeparation();
      
      console.log('=====================================');
      console.log('🎉 All SessionManager tests completed');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  /**
   * Demo the new session management workflow
   */
  static async demoWorkflow(): Promise<void> {
    console.group('🎬 SessionManager Workflow Demo');
    
    try {
      console.log('1. User visits app - checking existing session...');
      const authState = await SessionManager.getCurrentAuthState();
      console.log('   Auth state:', authState);
      
      console.log('2. User logs in with remember me...');
      // Simulate login with remember me
      SessionManager.cacheUserData({ id: 'demo-user', email: 'demo@example.com', role: 'buyer' });
      SessionManager.cacheUserRole('demo-user', 'buyer');
      SessionManager.setPersistentToken('demo-token-123', { rememberMe: true });
      console.log('   Login data cached in sessionStorage and localStorage');
      
      console.log('3. User closes browser, comes back later...');
      // Simulate browser close by clearing session storage
      SessionManager.clearAllSessionCache();
      console.log('   SessionStorage cleared (simulating browser close)');
      
      console.log('4. Check what persists...');
      const persistentToken = SessionManager.getPersistentToken();
      const sessionData = SessionManager.getCachedUserData();
      console.log('   Persistent token still available:', !!persistentToken);
      console.log('   Session data cleared:', !sessionData);
      
      console.log('5. User logs out...');
      await SessionManager.performCompleteLogout();
      console.log('   All storage cleared');
      
      console.log('6. Final state check...');
      SessionManager.logStorageState();
      
      console.log('✅ Workflow demo completed');
    } catch (error) {
      console.error('❌ Workflow demo failed:', error);
    }
    
    console.groupEnd();
  }
}

// Make the tester available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).SessionManagerTester = SessionManagerTester;
  console.log('🧪 SessionManagerTester available globally. Run SessionManagerTester.runAllTests() to test session management.');
}
