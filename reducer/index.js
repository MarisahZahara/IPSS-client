import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import thunk from "redux-thunk";
import storage from 'redux-persist/lib/storage'
import { createWrapper } from "next-redux-wrapper";
import { reducer as dataLoad } from "../reducer/state/state-load"

const rootReducers = combineReducers({
  load : dataLoad,
})

const persistConfig = {
  key: 'local-storage',
  storage,
}

const makeStore = () => store;
const persistedReducer = persistReducer(persistConfig, rootReducers)
export const wrapper = createWrapper(makeStore);
export const store = createStore(persistedReducer, {}, applyMiddleware(thunk))
export const persistor = persistStore(store)