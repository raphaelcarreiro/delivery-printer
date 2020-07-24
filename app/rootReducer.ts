import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import restaurant from 'store/modules/restaurant/reducer';
import user from 'store/modules/user/reducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    restaurant,
    user,
  });
}
