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
    
### Example requests
* https://tags.asterics-foundation.org:4000/tags
* https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY
* [https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY/children/1](https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY/children/1)
* [https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY/selfandchildren/1](https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY/selfandchildren/1)
* https://tags.asterics-foundation.org:4000/tag/ACCESSIBILITY/parents

