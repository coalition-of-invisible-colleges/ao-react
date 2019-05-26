Mutations are the builders whom construct the current state. The current state is the result of all the events in the system fed in order through the mutation functions.

The state of the application is divided into modules, i.e. top level fields on an in memory object. When a new event happens it is processed through the mutations.

The mutations are a function whose first argument is the current state, the second argument is the event that is being applied to the state.

For more information on mutations refer to the vuex documentation here: (https://vuex.vuejs.org/en/mutations.html). Note that we use the same format for state management on the backend as in the frontend. This allows clients to listen to the same event feed and keep there internal state up to date with the servers.
