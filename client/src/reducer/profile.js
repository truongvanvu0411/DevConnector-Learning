import { GET_PROFILE, PROFILE_ERR } from '../action/types';

const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  err: {},
};

function profileProducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false,
      };
    case PROFILE_ERR:
      return {
        ...state,
        loading: false,
        err: payload,
      };

    default:
      return state;
  }
}

export default profileProducer;
