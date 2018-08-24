import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {closeModal} from '../../actions/modal';
import UsersList from '../UsersList/UsersList';
import CloseButton from '../Common/CloseButton/CloseButton';
import {clearBodyHeight, setLikesFlagsListBodyHeight} from '../../actions/likesFlagsList';
import ReactResizeDetector from 'react-resize-detector';
import TabsBar from '../Common/TabsBar/TabsBar';
import Tab from '../Common/TabsBar/Tab/Tab';
import './likesFlagsList.css';
import Utils from '../../utils/Utils';
import Scroll from '../Scroll/Scroll';
import {setActiveIndex} from '../../actions/tabsBar';

const SCROLL_POINT_LIKES = 'likes';
const SCROLL_POINT_FLAGS = 'flags';

class LikesFlagsList extends React.Component {

	constructor() {
		super();
		this.updateBodyHeight = this.updateBodyHeight.bind(this);
	}

	static permLink(url, commentAuthor) {
		if (commentAuthor) {
			let correctPermlink = url.replace(/(@[\w-.]+\/)[^/]+\//, '$1');
			return correctPermlink.replace(/\/@[\w-.]+/, commentAuthor);
		}
		let urlObject = url.split('/');
		return `/${urlObject[urlObject.length - 2]}/${urlObject[urlObject.length - 1]}`;
	}

	componentWillReceiveProps(nextProps) {
		if (!Utils.equalsObjects(nextProps.window, this.props.window)) {
			this.updateBodyHeight()
		}
		if (this.props.commonLoader && !nextProps.commonLoader) {
			this.props.setActiveIndex('likesFlags', 0);
		}
	}

	componentWillUnmount() {
		this.props.clearBodyHeight();
	}

	componentDidUpdate() {
		let currentBody = this.props.activeIndex ? this.flags : this.likes;
		this.updateBodyHeight(undefined, ReactDOM.findDOMNode(currentBody).clientHeight);
	}

	updateBodyHeight(width, height) {
		const HEADER_HEIGHT = 48;
		const PADDING_BOTTOM = 40;

		let fullBodyHeight = height ? height : this.props.fullBodyHeight;
		fullBodyHeight = Math.max(fullBodyHeight, 120);
		let preferredBodyHeight = window.innerHeight * 0.95 - HEADER_HEIGHT - PADDING_BOTTOM;
		preferredBodyHeight = Math.min(preferredBodyHeight, fullBodyHeight);
		if (this.props.preferredBodyHeight !== preferredBodyHeight) {
			this.props.setBodyHeight(preferredBodyHeight, fullBodyHeight);
		}
	}

	render() {
		const {likes, flags, preferredBodyHeight, point, commonLoader} = this.props;

		let likesCondition = !likes.users || !likes.users.length;
		let flagsCondition = !flags.users || !flags.users.length;
		return (
			<div className="container_lik-lis">
				<CloseButton className="close-button_lik-lis" onClick={this.props.closeModal}/>
				<TabsBar point="likesFlags"
				         showLoader={false}
				         alwaysShowNavigation={true}
								 commonLoader={commonLoader}
				>
					<Tab name="Likes" empty={likesCondition && !flagsCondition}>
						<Scroll style={{width: '100%', height: preferredBodyHeight, marginTop: 20}}
						        point={SCROLL_POINT_LIKES}
						        deltaForFetch={1000}>
							<UsersList
								scrollPoint={SCROLL_POINT_LIKES}
								isLikesFlags={true}
								point={this.props.point}
								useScrollView={true}
								options={{likes: 1}}
								commonLoader={commonLoader}
							>
								<ReactResizeDetector handleWidth handleHeight onResize={this.updateBodyHeight}
								                     ref={ref => this.likes = ref}/>
							</UsersList>
						</Scroll>
					</Tab>
					<Tab name="Flags" empty={flagsCondition && !likesCondition}>
						<Scroll style={{width: '100%', height: preferredBodyHeight, marginTop: 20}}
						        point={SCROLL_POINT_FLAGS}
						        deltaForFetch={1000}>
							<UsersList
								scrollPoint={SCROLL_POINT_FLAGS}
								point={point}
								useScrollView={true}
								options={{flags: 1}}
								commonLoader={commonLoader}
							>
								<ReactResizeDetector handleWidth handleHeight onResize={this.updateBodyHeight}
								                     ref={ref => this.flags = ref}/>
							</UsersList>
						</Scroll>
					</Tab>
				</TabsBar>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	const point = `post${LikesFlagsList.permLink(state.posts[props.postIndex].url, props.commentAuthor)}/voters`;
  const likes = state.usersList[point + 'JSON_OPTIONS:{"likes":1}'] || {};
  const flags = state.usersList[point + 'JSON_OPTIONS:{"flags":1}'] || {};
  let commonLoader = true;
  if (!likes.loading && !flags.loading) {
    commonLoader = false;
  }
	return {
		point,
		likes,
		flags,
		commonLoader,
		...state.likesFlagsList,
		...state.tabsBar.likesFlags,
		window: state.window
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: () => {
			dispatch(closeModal("LikesFlagsList"))
		},
		setBodyHeight: (preferredBodyHeight, fullBodyHeight) => {
			dispatch(setLikesFlagsListBodyHeight(preferredBodyHeight, fullBodyHeight))
		},
		clearBodyHeight: (preferredBodyHeight, fullBodyHeight) => {
			dispatch(clearBodyHeight(preferredBodyHeight, fullBodyHeight))
		},
		setActiveIndex: (point, index) => {
			dispatch(setActiveIndex(point, index))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(LikesFlagsList);
