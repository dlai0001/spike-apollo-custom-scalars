Lessons Learned:
* even though value is defined on parent, the resolver is called.
* Using class constructors does not work for apollo resolver type.
* we can shim in promises into the parent in order to to lazily resolve refetching the updated parent.
