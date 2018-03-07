"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultDecorators = [{
  component: (0, _createReactClass.default)({
    displayName: "component",
    handleClick: function handleClick(e) {
      e.preventDefault();
      this.props.previousSlide();
    },
    getButtonStyles: function getButtonStyles(disabled) {
      return {
        border: 0,
        background: 'rgba(0,0,0,0.4)',
        color: 'white',
        padding: 10,
        outline: 0,
        opacity: disabled ? 0.3 : 1,
        cursor: 'pointer'
      };
    },
    render: function render() {
      return _react.default.createElement("button", {
        style: this.getButtonStyles(this.props.currentSlide === 0 && !this.props.wrapAround),
        onClick: this.handleClick
      }, "PREV");
    }
  }),
  position: 'CenterLeft'
}, {
  component: (0, _createReactClass.default)({
    displayName: "component",
    handleClick: function handleClick(e) {
      e.preventDefault();
      this.props.nextSlide();
    },
    getButtonStyles: function getButtonStyles(disabled) {
      return {
        border: 0,
        background: 'rgba(0,0,0,0.4)',
        color: 'white',
        padding: 10,
        outline: 0,
        opacity: disabled ? 0.3 : 1,
        cursor: 'pointer'
      };
    },
    render: function render() {
      return _react.default.createElement("button", {
        style: this.getButtonStyles(this.props.currentSlide + this.props.slidesToScroll >= this.props.slideCount && !this.props.wrapAround),
        onClick: this.handleClick
      }, "NEXT");
    }
  }),
  position: 'CenterRight'
}, {
  component: (0, _createReactClass.default)({
    displayName: "component",
    getIndexes: function getIndexes(count, inc) {
      var arr = [];

      for (var i = 0; i < count; i += inc) {
        arr.push(i);
      }

      return arr;
    },
    getListStyles: function getListStyles() {
      return {
        position: 'relative',
        margin: 0,
        top: -10,
        padding: 0
      };
    },
    getListItemStyles: function getListItemStyles() {
      return {
        listStyleType: 'none',
        display: 'inline-block'
      };
    },
    getButtonStyles: function getButtonStyles(active) {
      return {
        border: 0,
        background: 'transparent',
        color: 'black',
        cursor: 'pointer',
        padding: 10,
        outline: 0,
        fontSize: 24,
        opacity: active ? 1 : 0.5
      };
    },
    render: function render() {
      var _this = this;

      var indexes = this.getIndexes(this.props.slideCount, this.props.slidesToScroll);
      return _react.default.createElement("ul", {
        style: this.getListStyles()
      }, indexes.map(function (index) {
        return _react.default.createElement("li", {
          style: _this.getListItemStyles(),
          key: index
        }, _react.default.createElement("button", {
          style: _this.getButtonStyles(_this.props.currentSlide === index),
          onClick: _this.props.goToSlide.bind(null, index)
        }, "\u2022"));
      }));
    }
  }),
  position: 'BottomCenter'
}];
var _default = DefaultDecorators;
exports.default = _default;