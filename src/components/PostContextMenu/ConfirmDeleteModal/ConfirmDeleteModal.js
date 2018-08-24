import * as React from 'react';
import {connect} from 'react-redux';
import {deletePostAfterConfirm} from '../../../actions/post';
import './confirmDeleteModal.css';

class ConfirmDeleteModal extends React.Component {

	cancelDeleting() {
		this.props.closeModal();
	}

	deletePost() {
		!this.props.isComment ? this.props.closeAllModals() : this.props.closeModal();
		this.props.deletePostAfterConfirm(this.props.postIndex, this.props.isComment);
	}

	render() {
		return (
			<div className="wrapper_confirm-del-mod">
				<div className="body_confirm-del-mod">
					<p className="title_confirm-del-mod">Do you want to delete this object?</p>
					<p className="description_confirm-del-mod">Are you sure that you want to remove this? It will be impossible to
						undo this action.</p>
				</div>
				<div className="buttons_holder-del-mod">
					<button className="btn btn-cancel" onClick={this.cancelDeleting.bind(this)}>CANCEL</button>
					<button className="btn btn-default" onClick={this.deletePost.bind(this)}>DELETE</button>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		deletePostAfterConfirm: (postIndex, startDeleting) => {
			dispatch(deletePostAfterConfirm(postIndex, startDeleting))
		}
	}
};

export default connect(() => {
	return {}
}, mapDispatchToProps)(ConfirmDeleteModal);
