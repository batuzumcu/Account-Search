/**
 * Created by Batuhan Uzumcu on 11/10/2023
 */

@IsTest
private class AccountSearchControllerTest {
    @isTest static void testSearchAccounts() {
        // Create test data
        List<Account> testAccounts = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            testAccounts.add(new Account(
                    FirstName = 'Test' + i,
                    LastName = 'Account' + i,
                    RecordTypeId = [SELECT Id FROM RecordType WHERE SObjectType = 'Account' AND DeveloperName = 'PersonAccount' LIMIT 1].Id
            ));
        }
        insert testAccounts;

        // Call the method to test
        List<Account> searchResults = AccountSearchController.searchAccounts('Test');
    }
}