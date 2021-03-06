(function() {
    function displaySearchResults(results, store, a_results, a_store) {
        var searchResults = document.getElementById('search-results');

        if (results.length + a_results.length) { // Are there any results?
            var appendString = '';

            for (var i = 0; i < a_results.length; i++) {
                var item = a_store[a_results[i].ref];
                appendString += '<li><a target="_blank" href="' + item.url + '">' + item.Term + ': ' + item.Definition + '</a></li>';
            }

            for (var i = 0; i < results.length; i++) { // Iterate over the results
                var item = store[results[i].ref];
                appendString += '<li><a target="_blank" href="' + item.url + '">' + item.ThreatID + ': ' + item.Threat + '</a></li>';
            }

            searchResults.innerHTML = appendString;
        } else {
            searchResults.innerHTML = '<li>No results found</li>';
        }
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
    }

    var searchTerm = getQueryVariable('query');

    if (searchTerm) {
        document.getElementById('search-box').setAttribute("value", searchTerm);

        // Initalize lunr with the fields it will be searching on. I've given title
        // a boost of 10 to indicate matches on this field are more important.
        var idx = lunr(function() {
            this.field('ThreatID', {
                boost: 50
            });
            this.field('ThreatCategory');
            this.field('Threat', {
                boost: 10
            });
            this.field('ThreatOrigin');
            this.field('ExploitExample');
            this.field('CVEExample', {
                boost: 10
            });
            this.field('PossibleCountermeasures');
        });

        var acronym_idx = lunr(function() {
            this.field('Term');
            this.field('Definition');
        });

        for (var key in window.store) { // Add the data to lunr
            idx.add({
                'id': key,
                'ThreatID': window.store[key].ThreatID,
                'ThreatCategory': window.store[key].ThreatCategory,
                'Threat': window.store[key].Threat,
                'ThreatOrigin': window.store[key].ThreatOrigin,
                'ExploitExample': window.store[key].ExploitExample,
                'CVEExample': window.store[key].CVEExample,
                'PossibleCountermeasures': window.store[key].PossibleCountermeasures,
            });
        }

        for (var key in window.acronym_store) {
            acronym_idx.add({
                'id': key,
                'Term': window.acronym_store[key].Term,
                'Definition': window.acronym_store[key].Definition,
            });
        }

        var acronym_results = acronym_idx.search(searchTerm);
        var results = idx.search(searchTerm); // Get lunr to perform a search
        displaySearchResults(results, window.store, acronym_results, window.acronym_store); // We'll write this in the next section
    }
})();
