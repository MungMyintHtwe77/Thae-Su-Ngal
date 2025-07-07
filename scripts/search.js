// Advanced search functionality for Myint Store

// Search configuration
const searchConfig = {
    minSearchLength: 2,
    searchDelay: 300,
    maxResults: 20,
    highlightClass: 'search-highlight'
};

// Search state
let searchTimeout;
let searchHistory = [];
let searchSuggestions = [];

// Initialize advanced search
function initializeAdvancedSearch() {
    loadSearchHistory();
    createSearchSuggestions();
    setupSearchInput();
    setupSearchFilters();
}

// Setup search input with debounced search
function setupSearchInput() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    // Add input event listener with debounce
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length >= searchConfig.minSearchLength) {
            searchTimeout = setTimeout(() => {
                performAdvancedSearch(query);
                updateSearchSuggestions(query);
            }, searchConfig.searchDelay);
        } else {
            clearSearchResults();
        }
    });
    
    // Add focus event for search suggestions
    searchInput.addEventListener('focus', function() {
        showSearchSuggestions();
    });
    
    // Add blur event to hide suggestions
    searchInput.addEventListener('blur', function() {
        setTimeout(() => {
            hideSearchSuggestions();
        }, 200);
    });
}

// Perform advanced search with multiple criteria
function performAdvancedSearch(query) {
    const searchQuery = query.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    const searchResults = [];
    
    productCards.forEach(card => {
        const score = calculateSearchScore(card, searchQuery);
        if (score > 0) {
            searchResults.push({
                element: card,
                score: score
            });
        }
    });
    
    // Sort by relevance score
    searchResults.sort((a, b) => b.score - a.score);
    
    // Display results
    displaySearchResults(searchResults, query);
    
    // Add to search history
    addToSearchHistory(query);
}

// Calculate search score for relevance ranking
function calculateSearchScore(card, query) {
    const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
    const category = card.getAttribute('data-category')?.toLowerCase() || '';
    const price = card.querySelector('.product-price')?.textContent.toLowerCase() || '';
    
    let score = 0;
    
    // Exact title match gets highest score
    if (title.includes(query)) {
        score += 10;
        // Bonus for exact word match
        if (title.split(' ').some(word => word === query)) {
            score += 5;
        }
    }
    
    // Category match
    if (category.includes(query)) {
        score += 7;
    }
    
    // Price match
    if (price.includes(query)) {
        score += 3;
    }
    
    // Partial matches
    const queryWords = query.split(' ');
    queryWords.forEach(word => {
        if (word.length > 2) {
            if (title.includes(word)) score += 2;
            if (category.includes(word)) score += 1;
        }
    });
    
    return score;
}

// Display search results
function displaySearchResults(results, query) {
    const productCards = document.querySelectorAll('.product-card');
    const productsGrid = document.getElementById('products-grid');
    
    // Hide all products first
    productCards.forEach(card => {
        card.style.display = 'none';
        removeSearchHighlight(card);
    });
    
    if (results.length === 0) {
        showNoResultsMessage(query);
        return;
    }
    
    // Show matching products
    results.forEach(result => {
        result.element.style.display = 'block';
        highlightSearchTerms(result.element, query);
    });
    
    hideNoResultsMessage();
    
    // Update search results count
    updateSearchResultsCount(results.length, query);
}

// Highlight search terms in results
function highlightSearchTerms(card, query) {
    const title = card.querySelector('.product-title');
    if (title) {
        const originalText = title.textContent;
        const highlightedText = highlightText(originalText, query);
        title.innerHTML = highlightedText;
    }
}

// Remove search highlights
function removeSearchHighlight(card) {
    const title = card.querySelector('.product-title');
    if (title) {
        title.innerHTML = title.textContent;
    }
}

// Highlight text function
function highlightText(text, query) {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, `<mark class="${searchConfig.highlightClass}">$1</mark>`);
}

// Escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Clear search results
function clearSearchResults() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.display = 'block';
        removeSearchHighlight(card);
    });
    
    hideNoResultsMessage();
    hideSearchResultsCount();
}

// Create search suggestions
function createSearchSuggestions() {
    const searchContainer = document.getElementById('search-container');
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'search-suggestions';
    suggestionsContainer.className = 'search-suggestions';
    
    searchContainer.appendChild(suggestionsContainer);
    
    // Populate suggestions from product data
    updateSearchSuggestions();
}

// Update search suggestions
function updateSearchSuggestions(query = '') {
    const suggestions = [];
    const productCards = document.querySelectorAll('.product-card');
    
    // Get unique categories
    const categories = new Set();
    productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (category) categories.add(category);
    });
    
    // Get product titles
    const titles = [];
    productCards.forEach(card => {
        const title = card.querySelector('.product-title')?.textContent;
        if (title) titles.push(title);
    });
    
    // Add categories to suggestions
    categories.forEach(category => {
        if (!query || category.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
                text: category,
                type: 'category',
                icon: 'fas fa-tag'
            });
        }
    });
    
    // Add titles to suggestions
    titles.forEach(title => {
        if (!query || title.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
                text: title,
                type: 'product',
                icon: 'fas fa-box'
            });
        }
    });
    
    // Add search history
    searchHistory.forEach(historyItem => {
        if (!query || historyItem.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
                text: historyItem,
                type: 'history',
                icon: 'fas fa-history'
            });
        }
    });
    
    // Limit suggestions
    const limitedSuggestions = suggestions.slice(0, 8);
    
    renderSearchSuggestions(limitedSuggestions);
}

// Render search suggestions
function renderSearchSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!suggestions.length) {
        suggestionsContainer.innerHTML = '';
        return;
    }
    
    const suggestionsHTML = suggestions.map(suggestion => `
        <div class="search-suggestion" data-text="${suggestion.text}">
            <i class="${suggestion.icon}"></i>
            <span>${suggestion.text}</span>
            <span class="suggestion-type">${suggestion.type}</span>
        </div>
    `).join('');
    
    suggestionsContainer.innerHTML = suggestionsHTML;
    
    // Add click events to suggestions
    const suggestionElements = suggestionsContainer.querySelectorAll('.search-suggestion');
    suggestionElements.forEach(element => {
        element.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            const searchInput = document.getElementById('search-input');
            searchInput.value = text;
            performAdvancedSearch(text);
            hideSearchSuggestions();
        });
    });
}

// Show search suggestions
function showSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('active');
    }
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }
}

// Add to search history
function addToSearchHistory(query) {
    if (!searchHistory.includes(query)) {
        searchHistory.unshift(query);
        
        // Limit history size
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
        
        saveSearchHistory();
    }
}

// Save search history to localStorage
function saveSearchHistory() {
    try {
        localStorage.setItem('myintstore_search_history', JSON.stringify(searchHistory));
    } catch (e) {
        console.warn('Could not save search history:', e);
    }
}

// Load search history from localStorage
function loadSearchHistory() {
    try {
        const saved = localStorage.getItem('myintstore_search_history');
        if (saved) {
            searchHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load search history:', e);
        searchHistory = [];
    }
}

// Setup search filters
function setupSearchFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            const searchInput = document.getElementById('search-input');
            
            if (searchInput.value.trim()) {
                // If there's a search query, combine with filter
                performFilteredSearch(searchInput.value.trim(), filter);
            }
        });
    });
}

// Perform filtered search
function performFilteredSearch(query, filter) {
    const searchQuery = query.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    const searchResults = [];
    
    productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const matchesFilter = filter === 'all' || category === filter;
        
        if (matchesFilter) {
            const score = calculateSearchScore(card, searchQuery);
            if (score > 0) {
                searchResults.push({
                    element: card,
                    score: score
                });
            }
        }
    });
    
    // Sort by relevance score
    searchResults.sort((a, b) => b.score - a.score);
    
    // Display results
    displaySearchResults(searchResults, query);
}

// Show enhanced no results message
function showNoResultsMessage(query) {
    const productsGrid = document.getElementById('products-grid');
    let noResultsMsg = document.getElementById('no-results-message');
    
    if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'no-results-message';
        noResultsMsg.className = 'no-results-message';
        productsGrid.appendChild(noResultsMsg);
    }
    
    noResultsMsg.innerHTML = `
        <div class="no-results-content">
            <i class="fas fa-search"></i>
            <h3>No products found for "${query}"</h3>
            <p>Try adjusting your search terms or browse our categories.</p>
            <div class="search-suggestions-inline">
                <p>Popular searches:</p>
                <button class="suggestion-btn" onclick="searchFor('jewelry')">Jewelry</button>
                <button class="suggestion-btn" onclick="searchFor('crafts')">Crafts</button>
                <button class="suggestion-btn" onclick="searchFor('traditional')">Traditional</button>
            </div>
        </div>
    `;
    
    noResultsMsg.style.display = 'block';
}

// Search for suggested term
function searchFor(term) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = term;
    performAdvancedSearch(term);
    
    // Scroll to results
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Update search results count
function updateSearchResultsCount(count, query) {
    const productsSection = document.getElementById('products');
    let countElement = document.getElementById('search-results-count');
    
    if (!countElement) {
        countElement = document.createElement('div');
        countElement.id = 'search-results-count';
        countElement.className = 'search-results-count';
        
        const sectionHeader = productsSection.querySelector('.section-header');
        sectionHeader.appendChild(countElement);
    }
    
    countElement.innerHTML = `
        <p>Found ${count} result${count !== 1 ? 's' : ''} for "${query}"</p>
        <button class="clear-search-btn" onclick="clearSearch()">
            <i class="fas fa-times"></i> Clear Search
        </button>
    `;
    
    countElement.style.display = 'block';
}

// Hide search results count
function hideSearchResultsCount() {
    const countElement = document.getElementById('search-results-count');
    if (countElement) {
        countElement.style.display = 'none';
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    clearSearchResults();
    hideSearchSuggestions();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedSearch();
});

// Add search-specific CSS
function addSearchStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--gray-medium);
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            max-height: 0;
            overflow: hidden;
            z-index: 1001;
            transition: max-height 0.3s ease;
            box-shadow: var(--shadow-medium);
        }
        
        .search-suggestions.active {
            max-height: 300px;
        }
        
        .search-suggestion {
            padding: 0.75rem 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid var(--gray-light);
            transition: background-color 0.2s ease;
        }
        
        .search-suggestion:hover {
            background-color: var(--gray-light);
        }
        
        .search-suggestion:last-child {
            border-bottom: none;
        }
        
        .search-suggestion i {
            color: var(--primary-green);
            width: 16px;
        }
        
        .suggestion-type {
            margin-left: auto;
            font-size: 0.8rem;
            color: var(--text-light);
            text-transform: capitalize;
        }
        
        .search-highlight {
            background-color: var(--primary-yellow);
            padding: 0.1rem 0.2rem;
            border-radius: 2px;
        }
        
        .search-results-count {
            background: var(--light-green);
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-top: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .clear-search-btn {
            background: var(--primary-red);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s ease;
        }
        
        .clear-search-btn:hover {
            background: var(--dark-red);
        }
        
        .search-suggestions-inline {
            margin-top: 1rem;
        }
        
        .suggestion-btn {
            background: var(--primary-green);
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            margin: 0.2rem;
            font-size: 0.9rem;
            transition: background-color 0.2s ease;
        }
        
        .suggestion-btn:hover {
            background: var(--dark-green);
        }
        
        @media (max-width: 768px) {
            .search-results-count {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
            
            .search-suggestions-inline {
                text-align: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Add styles when script loads
addSearchStyles();
