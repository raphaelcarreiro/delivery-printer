import { createStore } from 'redux';
import reducers from './__reducers';

const store = createStore(reducers);

export { store };
