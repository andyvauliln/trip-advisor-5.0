export default function usersList(state = {}, action) {
	switch (action.type) {
		case 'INIT_USERS_LIST':
			return {
				...state,
				[action.options.point]: action.options,
			};

		case 'GET_USERS_LIST_REQUEST':
			return {
				...state,
				[action.point]: {
					...state[action.point],
					loading: true
				}
			};

		case 'CLEAR_USERS':
			return {
				...state,
				[action.point]: {}
			};

		case 'GET_USERS_LIST_SUCCESS':
			let usersArr;
			if (action.options.users) {
				usersArr = [...state[action.options.point].users, ...action.options.users];
			} else {
				usersArr = [];
			}
			return {
				...state,
				[action.options.point]: {
					...state[action.options.point],
					loading: false,
					hasMore: action.options.hasMore,
					users: usersArr,
					offset: action.options.offset
				}
			};

		case 'GET_USERS_LIST_ERROR':
			return {
				...state,
				[action.point]: {
					...state[action.point],
					loading: false,
					errorMessage: action.error
				}
			};

		default:
			return state;
	}
}
