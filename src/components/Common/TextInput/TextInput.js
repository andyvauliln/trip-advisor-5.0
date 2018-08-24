import React from 'react';
import Utils from '../../../utils/Utils';
import ShowIf from '../ShowIf';
import ReactResizeDetector from 'react-resize-detector';
import {connect} from 'react-redux';
import {
	blurredTextInput,
	clearTextInputState,
	focusedTextInput,
	initTextInput,
	setTextInputError,
	setTextInputState
} from '../../../actions/textInput';
import './textInput.css';
import Constants from '../../../common/constants';

class TextInput extends React.Component {
	static MARGIN_TEXT = 21;

	static defaultProps = {
		label: '',
		maxLength: 2048,
		multiline: true,
		maxHeight: 1000,
		required: false,
		smallFont: false,
		errorMsg: '',
		noValidCharacters: '',
		disabled: false,
		password: false
	};

	constructor(props) {
		super(props);
		const fontSize = props.smallFont ? 11 : 14;
		const fontPadding = props.smallFont ? 7 : 9;
		const lineHeight = fontSize + fontPadding;
		let maxHeight = props.maxHeight - TextInput.MARGIN_TEXT;
		maxHeight = Math.round(maxHeight / lineHeight) * lineHeight;
		const state = {
			fontSize,
			fontPadding,
			lineHeight,
			areaPadding: lineHeight / 2,
			minAreaHeight: lineHeight * 2,
			prefAreaHeight: lineHeight,
			error: '',
			focusedStyle: props.value ? Constants.TEXT_INPUT_POINT.COMMENT_INPUT_ACTIVE_CLASS : '',
			text: props.value,
			maxHeight,
			focused: false
		};
		props.initTextInput(this.props.point, state);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value && (this.props.value !== nextProps.value)) {
			this._updateTextValue.call(this, nextProps.value);
		}
		if (this.input && nextProps.focused) {
			this.input.focus();
		}
		if (this.input && !nextProps.focused) {
			this.input.blur();
		}
		return true;
	}

	componentWillUnmount() {
		this.props.clearTextInputState(this.props.point);
	}

	onChange(event) {
		let newValue = Utils.cloneObject(event.target.value);
		newValue = this._removeInvalidCharacters(newValue);
		if (this.props.error) {
			this.props.setTextInputError(Constants.TEXT_INPUT_POINT.TITLE, '');
		}
		if (newValue !== this.props.text) {
			this._updateTextValue(newValue);
		}
	}

	_removeInvalidCharacters(str) {
		let regExp = new RegExp(this.props.noValidCharacters);
		str = str.replace(regExp, '');
		if (!this.props.multiline) {
			str = str.replace('\n', '');
		}
		return str;
	}

	_updateTextValue(newValue) {
		const focusedStyle = Utils.isNotEmptyString(newValue) ? 'focused_tex-inp' : '';
		const state = {
			focusedStyle,
			text: newValue
		};
		this.props.setTextInputState(this.props.point, state);
		if (this.props.onChange) {
			this.props.onChange(newValue);
		}
	}

	_callFunctionsFromProps(lastCharCode) {
		if (this.props.keyPressEvents) {
			this.props.keyPressEvents.forEach(actionObj => {
				actionObj.keys.forEach(charCode => {
					if (charCode === lastCharCode) {
						actionObj.func();
					}
				})
			})
		}
	}

	resizeHiddenDiv() {
		if (!this.hiddenDiv) {
			return;
		}
		let prefAreaHeight = this.hiddenDiv.clientHeight;
		prefAreaHeight = Math.min(prefAreaHeight, this.props.maxHeight);
		let areaPadding = prefAreaHeight === this.props.lineHeight ? this.props.lineHeight / 2 : 0;
		const state = {
			prefAreaHeight,
			areaPadding
		};
		this.props.setTextInputState(this.props.point, state);
	}

	get areaModifier() {
		let areaModifier = this.props.error ? ' has-error_tex-inp' : '';
		return areaModifier + this.props.multiline ? ' multiline_tex-inp' : '';
	}

	_keyUp(e) {
		let keyCode = e.keyCode || e.which;
		if (keyCode === 0 || keyCode === 229) {
			keyCode = this.input.value.charCodeAt(this.input.value.length - 1);
		}
		this._callFunctionsFromProps(keyCode);
	}

	render() {
		if (!this.props.fontSize) {
			return null;
		}
		return (
			<div className="container_tex-inp">
				<div className="input-container_tex-inp">
          <textarea className={'area_tex-inp input-text_tex-inp' + this.areaModifier}
                    onChange={this.onChange.bind(this)}
                    onKeyUp={this._keyUp.bind(this)}
                    value={this.props.text}
                    maxLength={this.props.maxLength}
                    ref={ref => this.input = ref}
                    style={{
	                    padding: this.props.areaPadding + 'px 0',
	                    fontSize: this.props.fontSize + 'px',
	                    height: this.props.prefAreaHeight,
	                    minHeight: this.props.minAreaHeight
                    }}
                    onFocus={() => this.props.focusedTextInput(this.props.point)}
                    onBlur={() => this.props.blurredTextInput(this.props.point)}
                    disabled={this.props.disabled}
          />
					<label className={'title_tex-inp ' + this.props.focusedStyle}
					       onClick={() => this.input.focus()}
					       style={this.props.smallFont ? {fontSize: '12px'} : {}}>
						{this.props.title}
						<ShowIf show={this.props.required}>
							<span className="required_tex-inp"> *</span>
						</ShowIf>
					</label>
					<div className={'hidden-div_tex-inp' + this.areaModifier}
					     ref={ref => this.hiddenDiv = ref}
					     style={{
						     fontSize: this.props.fontSize + 'px',
						     lineHeight: this.props.lineHeight + 'px',
						     minHeight: this.props.lineHeight
					     }}
					>
						{this.props.text + '\n'}
						<ReactResizeDetector handleWidth handleHeight onResize={this.resizeHiddenDiv.bind(this)}/>
					</div>
				</div>
				<ShowIf show={this.props.children}>
					<div className="children_tex-inp">
						{this.props.children}
					</div>
				</ShowIf>
				<ShowIf show={this.props.error}>
					<div className="error_tex-inp">
						{this.props.error}
					</div>
				</ShowIf>
				<ShowIf show={this.props.description}>
					<div className="description_tex-inp">
						{this.props.description}
					</div>
				</ShowIf>
			</div>
		);
	}
}


const mapStateToProps = (state, props) => {
	return {
		...state.textInput[props.point]
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		initTextInput: (point, state) => {
			dispatch(initTextInput(point, state));
		},
		setTextInputState: (point, state) => {
			dispatch(setTextInputState(point, state));
		},
		setTextInputError: (point, message) => {
			dispatch(setTextInputError(point, message));
		},
		focusedTextInput: (point) => {
			dispatch(focusedTextInput(point));
		},
		blurredTextInput: (point) => {
			dispatch(blurredTextInput(point));
		},
		clearTextInputState: (point) => {
			dispatch(clearTextInputState(point))
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(TextInput);
