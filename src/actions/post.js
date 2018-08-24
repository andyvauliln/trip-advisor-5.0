import {getStore} from '../store/configureStore';
import {push} from 'react-router-redux';
import {initPostsList} from './postsList';
import {initPostModal} from './postModal';
import {pushErrorMessage, pushMessage} from './pushMessage';
import {actionLock, actionUnlock} from './session';
import Constants from '../common/constants';
import PostService from '../services/PostService';
import CommentService from '../services/CommentService';
import {closeAllModals, closeModal, openModal} from './modal';
import * as React from 'react';
import ConfirmDeleteModal from '../components/PostContextMenu/ConfirmDeleteModal/ConfirmDeleteModal';

function addPosts(posts) {
	return {
		type: 'ADD_POSTS',
		posts
	}
}

export function updatePost(postIndex, newVoteState, newFlagState) {
	return (dispatch) => {
		if (!postIndex.includes('#')) {
			updatePostData(dispatch, postIndex, newVoteState, newFlagState);
		} else {
			updateCommentData(dispatch, postIndex, newVoteState, newFlagState)
		}
	}
}

function updatePostData(dispatch, postUrl, newVoteState, newFlagState) {
	PostService.getPost(postUrl)
		.then((response) => {
			let newItem = updateFromResponse(postUrl, response, newVoteState, newFlagState);
			dispatch({
				type: 'UPDATE_POST',
				post: newItem
			})
		});
}

function updateCommentData(dispatch, postIndex, newVoteState, newFlagState) {
	CommentService.getComment(postIndex)
		.then((response) => {
			let newItem = updateFromResponse(postIndex, response, newVoteState, newFlagState);
			dispatch({
				type: 'UPDATE_COMMENT',
				[postIndex]: newItem
			})
		});
}

function updateFromResponse(postIndex, response, newVoteState, newFlagState) {
	let newItem = getStore().getState().posts[postIndex];
	newItem.vote = !!newVoteState;
	newItem.flag = !!newFlagState;
	newItem.net_likes = response.net_likes;
	newItem.net_votes = response.net_votes;
	newItem.net_flags = response.net_flags;
	newItem.total_payout_reward = response.total_payout_reward;
	return newItem;
}

export function setPowerLikeInd(postIndex, isOpen) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_IND',
			index: postIndex,
			isPLOpen: isOpen
		})
	}
}

export function setPowerLikeTimeout(postIndex, timeout) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_TIMEOUT',
			index: postIndex,
			plTimeout: timeout
		})
	}
}

export function setChangeStatus(postIndex, param) {
	return (dispatch) => {
		dispatch({
			type: 'POWER_OF_LIKE_CHANGE_STATUS',
			index: postIndex,
			changeStatus: param
		})
	}
}

export function setHidePowerLikeTimeout(postIndex, timeout) {
	return (dispatch) => {
		dispatch({
			type: 'HIDE_POWER_OF_LIKE_TIMEOUT',
			index: postIndex,
			hplTimeout: timeout
		})
	}
}

export function setSliderWidth(postIndex, width) {
	return (dispatch) => {
		dispatch({
			type: 'SET_SLIDER_TIMEOUT',
			index: postIndex,
			sliderWidth: width
		})
	}
}

function deletePostRequest(postIndex) {
	return {
		type: 'DELETE_POST_REQUEST',
		index: postIndex
	}
}

function deletePostSuccess(postIndex) {
	return {
		type: 'DELETE_POST_SUCCESS',
		index: postIndex
	}
}

function deleteCommentSuccess(postIndex) {
	return {
		type: 'DELETE_COMMENT_SUCCESS',
		index: postIndex
	}
}

function deletePostError(postIndex, error) {
	return {
		type: 'DELETE_POST_ERROR',
		index: postIndex,
		error
	}
}

export function deletePost(postIndex, isComment = false) {
	return dispatch => {
		let modalOption = {
			body: (<ConfirmDeleteModal
				closeModal={() => dispatch(closeModal("ConfirmDeleteModal"))}
				closeAllModals={() => dispatch(closeAllModals())}
				postIndex={postIndex}
				isComment={isComment}/>)
		};
		dispatch(openModal("ConfirmDeleteModal", modalOption));
	}
}

export function deletePostAfterConfirm(postIndex, isComment) {
	return dispatch => {
		let state = getStore().getState();
		if (state.session.actionLocked) {
			return;
		}
		dispatch(actionLock());
		dispatch(deletePostRequest(postIndex));
		PostService.deletePost(state.posts[postIndex], isComment)
			.then(() => {
				dispatch(actionUnlock());
				if (isComment) {
					dispatch(deleteCommentSuccess(postIndex));
					dispatch(pushMessage(Constants.DELETE.DELETE_COMMENT_SUCCESS));
				} else {
					dispatch(deletePostSuccess(postIndex));
					dispatch(pushMessage(Constants.DELETE.DELETE_POST_SUCCESS));
				}
			})
			.catch(error => {
				dispatch(actionUnlock());
				dispatch(pushErrorMessage(error));
				dispatch(deletePostError(postIndex, error));
			});
	}
}

export function addSinglePost(url) {
	return async dispatch => {
		const urlObject = url.split('/');
		if (urlObject.length >= 3) {
			await PostService.getPost(url)
				.then((result) => {
					if (result) {
						let postOptions = {
							point: 'SinglePost',
							maxPosts: 1,
							loading: false,
							posts: [result.url],
							length: 0,
							hasMore: false,
						};
						dispatch(initPostsList(postOptions));
						dispatch(addPosts({
							[result.url]: {
								...result,
								isVideo: result.media[0].url.match(/mp4$/i),
								isGif: result.media[0].url.match(/gif$/i)
							}
						}));
						dispatch(initPostModal('SinglePost', result.url));
					}
				});
			return;
		}
		dispatch(push('/'));
		dispatch(pushMessage(
			'Something went wrong, please, check the URL or try again later'));
	}
}


export function playVideo(index) {
	return {
		type: 'POST_PLAY_VIDEO',
		index
	}
}

export function stopVideo(index) {
	return {
		type: 'POST_STOP_VIDEO',
		index
	}
}

export function setVideoTime(index, time) {
	return {
		type: 'SET_VIDEO_TIME',
		index,
		time
	}
}