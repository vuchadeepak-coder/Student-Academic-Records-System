function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        currentUser: action.user,
        role: action.role,
      };

    case "LOGOUT":
      return {
        ...state,
        currentUser: null,
        role: null,
      };

    default:
      return state;
  }
}