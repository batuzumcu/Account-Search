/**
 * Created by Batuhan Uzumcu on 11/10/2023.
 */

public with sharing class AccountSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchString) {
        String searchKey = '%' + searchString + '%';
        return [SELECT Id, FirstName, LastName FROM Account WHERE (FirstName LIKE :searchKey OR LastName LIKE :searchKey) AND IsPersonAccount = true LIMIT 200];
    }
}