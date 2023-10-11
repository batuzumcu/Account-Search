/**
 * Created by Batuhan Uzumcu on 11/10/2023.
 */

import { LightningElement, track } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountSearchController.searchAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * AccountSearch.js
 * This component allows users to search for person accounts and display the results
 * Pagination functionality is provided to navigate through large result sets
 * Each record can be viewed in detail by clicking on the 'View' button
 */
export default class AccountSearch extends LightningElement {
    // Tracks the current search string input by the user
    @track searchString = '';

    // Contains all search results
    @track allAccounts = [];

    // Contains the subset of search results for the current page
    @track accounts = [];

    // Determines if search results should be displayed
    @track showResults = false;

    // Flags when no results are found for a search
    @track noResultsFound = false;

    // Pagination variables.
    currentPage = 1;
    recordsPerPage = 20;
    totalPages;

    /**
     * Structure for the columns in the result table
     * This includes the number, first name, last name, and view button for each account
     */
    columns = [
        { label: 'No', fieldName: 'lineNumber', type: 'text' },
        { label: 'First Name', fieldName: 'FirstName', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName', type: 'text' },
        {
            label: 'Account Page',
            type: 'button',
            typeAttributes: {
                label: 'View',
                name: 'view_details',
                title: 'Click to view details',
                disabled: false,
                value: 'view',
                iconPosition: 'left'
            }
        },
    ];

    /**
     * Handle changes in the search input box
     * @param {Event} event - The event containing the new input value
     */
    handleSearchChange(event) {
        this.searchString = event.target.value.trim();
    }

    /**
     * Conduct a search based on the user's input
     * Displays results or relevant error messages
     */
    handleSearch() {
        if (!this.searchString) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Input Required',
                    message: 'Please enter at least one character to search',
                    variant: 'warning',
                })
            );
            return;
        }

        this.showResults = true;
        this.noResultsFound = false;

        searchAccounts({ searchString: this.searchString })
            .then(result => {
                this.allAccounts = result.map((record, index) => ({
                    ...record,
                    lineNumber: index + 1
                }));
                this.totalPages = Math.ceil(this.allAccounts.length / this.recordsPerPage);
                this.currentPage = 1;
                this.loadPageData();
            })
            .catch(error => {
                let errorMessage = 'Unknown error';
                if (Array.isArray(error.body) && error.body.length) {
                    errorMessage = error.body[0].message;
                } else if (typeof error.body.message === 'string') {
                    errorMessage = error.body.message;
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error fetching accounts',
                        message: errorMessage,
                        variant: 'error',
                    })
                );
            });
    }

    /**
     * Loads the data for the current page from allAccounts into accounts
     */
    loadPageData() {
        const startIdx = (this.currentPage - 1) * this.recordsPerPage;
        this.accounts = this.allAccounts.slice(startIdx, startIdx + this.recordsPerPage);
        this.noResultsFound = this.accounts.length === 0;
    }

    /**
     * Move to the previous page of results, if available
     */
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPageData();
        }
    }

    /**
     * Move to the next page of results, if available
     */
    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadPageData();
        }
    }

    /**
     * Check if the 'Previous' button should be disabled
     * @returns {boolean} - True if on the first page, false otherwise
     */
    get isPreviousButtonDisabled() {
        return this.currentPage === 1;
    }

    /**
     * Check if the 'Next' button should be disabled
     * @returns {boolean} - True if on the last page, false otherwise
     */
    get isNextButtonDisabled() {
        return this.currentPage === this.totalPages;
    }

    /**
     * Display the current page and total pages
     * @returns {string} - The string representing the current page info
     */
    get displayPageInfo() {
        return this.totalPages === 0 ? 'No pages available' : `Page ${this.currentPage} of ${this.totalPages}`;
    }

    /**
     * Handle actions (like opening account record page on a new tab) on the result table rows
     * @param {Event} event - The event containing details of the row action
     */
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        if (actionName === 'view_details') {
            const url = `/lightning/r/Account/${event.detail.row.Id}/view`;
            window.open(url, '_blank');
        }
    }
}