# accessibility-info-tree
Structured information collection about all kinds of topics in the field of accessibility. See [live version](https://wbt-vienna.github.io/accessibility-info-tree/).

## REST API
It's possible to retrieve the hierarchy of tags using the following REST commands:
* **/tags** retrieves a list of all tags
* **/tag/:id** retrieves a single tag by ID
* **/tag/:id/children/:maxdepth?** retrieves a list of children of a tag
    * *maxdepth* (optional): maximum depth of children to include ('1' in order to retrieve only direct children). Default: no limit.
* **/tag/:id/selfandchildren/:maxdepth?** retrieves a tag and it's children
    * *maxdepth* (optional): maximum depth of children to include ('1' in order to retrieve only direct children). Default: no limit.
* **/tag/:id/parents/:maxdepth?** retrieves a list of parents of a tag
    * *maxdepth* (optional): maximum depth of parents to include ('1' in order to retrieve only direct parents). Default: no limit.
* **/entries** retrieves a list of all entries
* **/entries/search/:query** retrieves a list of entries, filtered by a search query
    * *query* the text to search for. Title, short description, URL and translated tag names are searched for
* **/entries/tags/:taglist/:joinmode?** retrieves a list of entries, filtered by a list of tags
    * *taglist* list of tag-IDs, separated by semicolon (";")
    * *joinmode* (optional) join mode for the given tags. Valid options: "AND", "OR", "NOT". Default: "AND".
 
### Example requests
* https://couchdb.asterics-foundation.org:4000/tags
* https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY
* [https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY/children/1](https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY/children/1)
* [https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY/selfandchildren/1](https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY/selfandchildren/1)
* https://couchdb.asterics-foundation.org:4000/tag/ACCESSIBILITY/parents
* https://couchdb.asterics-foundation.org:4000/entries
* https://couchdb.asterics-foundation.org:4000/entries/search/foundation
* [https://couchdb.asterics-foundation.org:4000/entries/tags/AAC;WORK_WORLD](https://couchdb.asterics-foundation.org:4000/entries/tags/AAC;WORK_WORLD)
* [https://couchdb.asterics-foundation.org:4000/entries/tags/AAC;WORK_WORLD/NOT](https://couchdb.asterics-foundation.org:4000/entries/tags/AAC;WORK_WORLD/NOT)

