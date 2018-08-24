import React from 'react';
import {connect} from 'react-redux';
import ShowIf from '../Common/ShowIf';
import {setPostModalOptions} from '../../actions/postModal';

const LowNSFWFilter = ({fullScreenMode, post, showAll, setPostModalOptions}) => {

	let backgroundStyle = {backgroundColor: fullScreenMode ? 'rgba(0, 0, 0, .96)' : 'rgba(255, 255, 255, .96)'};
	let colorTitleStyle = {color: fullScreenMode ? '#ffffff' : '#000000'};
	let colorMessageStyle = {color: fullScreenMode ? '#f3f3f2' : '#696969'};
	let buttonColor = fullScreenMode ? {color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, .96)'}
		: {color: '#000000', backgroundColor: 'rgba(255, 255, 255, .96)'};

	function setShowNSFW() {
    setPostModalOptions({showAll: true});
	}

	return (
		<div className="container-nsfw-filter_pos-mod">
			<ShowIf show={post['is_nsfw'] && !showAll}>
				<div className="curtain_pos-mod" style={backgroundStyle}>
					<p className="title-low-nsfw_pos-mod" style={colorTitleStyle}>NSFW content</p>
					<p className="message-low-nsfw_pos-mod"
					   style={colorMessageStyle}
					>This content is for adults only. Not recommended for children or sensitive individuals.</p>
					<button className="btn btn-cancel"
					        onClick={setShowNSFW}
					        style={buttonColor}
					>Show me
					</button>
				</div>
			</ShowIf>
			<ShowIf show={post['is_low_rated'] && !showAll && !post['is_nsfw']}>
				<div className="curtain_pos-mod" style={backgroundStyle}>
					<p className="title-low-nsfw_pos-mod" style={colorTitleStyle}>Low rated content</p>
					<p className="message-low-nsfw_pos-mod"
					   style={colorMessageStyle}
					>This content is hidden due to low ratings.</p>
					<button className="btn btn-cancel"
					        onClick={setShowNSFW}
					        style={buttonColor}
					>Show me
					</button>
				</div>
			</ShowIf>
		</div>
	)
};

const mapDispatchToProps = dispatch => {
	return {
		setPostModalOptions: options => {
			dispatch(setPostModalOptions(options));
		}
	}
};

export default connect(() => {return {}}, mapDispatchToProps)(LowNSFWFilter);