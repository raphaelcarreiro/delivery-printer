import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';
import reducers from './__reducers';

export type RootState = ReturnType<typeof reducers>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
