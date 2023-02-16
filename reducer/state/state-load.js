const initialState = {
  isLoad : false
}

export function reducer(state = initialState, action){
  const { payload, type } = action
  switch (type) {
    default:
      return state;
  }
}