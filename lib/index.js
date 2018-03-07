"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactTweenState = _interopRequireDefault(require("react-tween-state"));

var _decorators = _interopRequireDefault(require("./decorators"));

var _objectAssign = _interopRequireDefault(require("object-assign"));

var _exenv = _interopRequireDefault(require("exenv"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var addEvent = function addEvent(elem, type, eventHandle) {
  if (elem === null || typeof elem === 'undefined') {
    return;
  }

  if (elem.addEventListener) {
    elem.addEventListener(type, eventHandle, false);
  } else if (elem.attachEvent) {
    elem.attachEvent("on".concat(type), eventHandle);
  } else {
    elem["on".concat(type)] = eventHandle;
  }
};

var removeEvent = function removeEvent(elem, type, eventHandle) {
  if (elem === null || typeof elem === 'undefined') {
    return;
  }

  if (elem.removeEventListener) {
    elem.removeEventListener(type, eventHandle, false);
  } else if (elem.detachEvent) {
    elem.detachEvent("on".concat(type), eventHandle);
  } else {
    elem["on".concat(type)] = null;
  }
};

var Carousel = (0, _createReactClass.default)({
  displayName: 'Carousel',
  propTypes: {
    afterSlide: _propTypes.default.func,
    autoplay: _propTypes.default.bool,
    autoplayInterval: _propTypes.default.number,
    beforeSlide: _propTypes.default.func,
    animation: _propTypes.default.oneOf(['animation']),
    cellAlign: _propTypes.default.oneOf(['left', 'center', 'right']),
    cellSpacing: _propTypes.default.number,
    data: _propTypes.default.func,
    decorators: _propTypes.default.arrayOf(_propTypes.default.shape({
      component: _propTypes.default.func,
      position: _propTypes.default.oneOf(['TopLeft', 'TopCenter', 'TopRight', 'CenterLeft', 'CenterCenter', 'CenterRight', 'BottomLeft', 'BottomCenter', 'BottomRight']),
      style: _propTypes.default.object
    })),
    dragging: _propTypes.default.bool,
    easing: _propTypes.default.string,
    edgeEasing: _propTypes.default.string,
    frameOverflow: _propTypes.default.string,
    framePadding: _propTypes.default.string,
    initialSlideHeight: _propTypes.default.number,
    initialSlideWidth: _propTypes.default.number,
    slideIndex: _propTypes.default.number,
    slidesToScroll: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.oneOf(['auto'])]),
    slidesToShow: _propTypes.default.number,
    slideWidth: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
    speed: _propTypes.default.number,
    swiping: _propTypes.default.bool,
    vertical: _propTypes.default.bool,
    width: _propTypes.default.string,
    wrapAround: _propTypes.default.bool
  },
  mixins: [_reactTweenState.default.Mixin],
  getDefaultProps: function getDefaultProps() {
    return {
      afterSlide: function afterSlide() {},
      autoplay: false,
      autoplayInterval: 3000,
      beforeSlide: function beforeSlide() {},
      cellAlign: 'left',
      cellSpacing: 0,
      data: function data() {},
      decorators: _decorators.default,
      dragging: true,
      easing: 'easeOutCirc',
      edgeEasing: 'easeOutElastic',
      framePadding: '0px',
      frameOverflow: 'hidden',
      slideIndex: 0,
      slidesToScroll: 1,
      slidesToShow: 1,
      slideWidth: 1,
      speed: 500,
      swiping: true,
      vertical: false,
      width: '100%',
      wrapAround: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      currentSlide: this.props.slideIndex,
      dragging: false,
      frameWidth: 0,
      left: 0,
      slideCount: 0,
      slidesToScroll: this.props.slidesToScroll,
      slideWidth: 0,
      top: 0
    };
  },
  componentWillMount: function componentWillMount() {
    this.setInitialDimensions();
  },
  componentDidMount: function componentDidMount() {
    // see https://github.com/facebook/react/issues/3417#issuecomment-121649937
    this.mounted = true;
    this.setDimensions();
    this.bindEvents();
    this.setExternalData();

    if (this.props.autoplay) {
      this.startAutoplay();
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      slideCount: nextProps.children.length
    });
    this.setDimensions(nextProps);

    if (this.props.slideIndex !== nextProps.slideIndex && nextProps.slideIndex !== this.state.currentSlide) {
      this.goToSlide(nextProps.slideIndex);
    }

    if (this.props.autoplay !== nextProps.autoplay) {
      if (nextProps.autoplay) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.unbindEvents();
    this.stopAutoplay(); // see https://github.com/facebook/react/issues/3417#issuecomment-121649937

    this.mounted = false;
  },
  // Touch Events
  touchObject: {},
  getTouchEvents: function getTouchEvents() {
    if (this.props.swiping === false) {
      return null;
    }

    return {
      onTouchStart: function onTouchStart(e) {
        this.touchObject = {
          startX: e.touches[0].pageX,
          startY: e.touches[0].pageY
        };
        this.handleMouseOver();
      },
      onTouchMove: function onTouchMove(e) {
        var direction = this.swipeDirection(this.touchObject.startX, e.touches[0].pageX, this.touchObject.startY, e.touches[0].pageY);

        if (direction !== 0) {
          e.preventDefault();
        }

        var length = this.props.vertical ? Math.round(Math.sqrt(Math.pow(e.touches[0].pageY - this.touchObject.startY, 2))) : Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - this.touchObject.startX, 2)));
        this.touchObject = {
          startX: this.touchObject.startX,
          startY: this.touchObject.startY,
          endX: e.touches[0].pageX,
          endY: e.touches[0].pageY,
          length: length,
          direction: direction
        };
        this.setState({
          left: this.props.vertical ? 0 : this.getTargetLeft(this.touchObject.length * this.touchObject.direction),
          top: this.props.vertical ? this.getTargetLeft(this.touchObject.length * this.touchObject.direction) : 0
        });
      },
      onTouchEnd: function onTouchEnd(e) {
        this.handleSwipe(e);
        this.handleMouseOut();
      },
      onTouchCancel: function onTouchCancel(e) {
        this.handleSwipe(e);
      }
    };
  },
  clickSafe: true,
  getMouseEvents: function getMouseEvents() {
    var _this = this;

    if (this.props.dragging === false) {
      return null;
    }

    return {
      onMouseOver: function onMouseOver() {
        return _this.handleMouseOver();
      },
      onMouseOut: function onMouseOut() {
        return _this.handleMouseOut();
      },
      onMouseDown: function onMouseDown(e) {
        _this.touchObject = {
          startX: e.clientX,
          startY: e.clientY
        };

        _this.setState({
          dragging: true
        });
      },
      onMouseMove: function onMouseMove(e) {
        if (!_this.state.dragging) {
          return;
        }

        var direction = _this.swipeDirection(_this.touchObject.startX, e.clientX, _this.touchObject.startY, e.clientY);

        if (direction !== 0) {
          e.preventDefault();
        }

        var length = _this.props.vertical ? Math.round(Math.sqrt(Math.pow(e.clientY - _this.touchObject.startY, 2))) : Math.round(Math.sqrt(Math.pow(e.clientX - _this.touchObject.startX, 2)));
        _this.touchObject = {
          startX: _this.touchObject.startX,
          startY: _this.touchObject.startY,
          endX: e.clientX,
          endY: e.clientY,
          length: length,
          direction: direction
        };

        _this.setState({
          left: _this.props.vertical ? 0 : _this.getTargetLeft(_this.touchObject.length * _this.touchObject.direction),
          top: _this.props.vertical ? _this.getTargetLeft(_this.touchObject.length * _this.touchObject.direction) : 0
        });
      },
      onMouseUp: function onMouseUp(e) {
        if (!_this.state.dragging) {
          return;
        }

        _this.handleSwipe(e);
      },
      onMouseLeave: function onMouseLeave(e) {
        if (!_this.state.dragging) {
          return;
        }

        _this.handleSwipe(e);
      }
    };
  },
  handleMouseOver: function handleMouseOver() {
    if (this.props.autoplay) {
      this.autoplayPaused = true;
      this.stopAutoplay();
    }
  },
  handleMouseOut: function handleMouseOut() {
    if (this.props.autoplay && this.autoplayPaused) {
      this.startAutoplay();
      this.autoplayPaused = null;
    }
  },
  handleClick: function handleClick(e) {
    if (this.clickSafe === true) {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  },
  handleSwipe: function handleSwipe() {
    if (typeof this.touchObject.length !== 'undefined' && this.touchObject.length > 44) {
      this.clickSafe = true;
    } else {
      this.clickSafe = false;
    }

    var slidesToShow = this.props.slidesToShow;

    if (this.props.slidesToScroll === 'auto') {
      slidesToShow = this.state.slidesToScroll;
    }

    if (this.touchObject.length > this.state.slideWidth / slidesToShow / 5) {
      if (this.touchObject.direction === 1) {
        if (this.state.currentSlide >= _react.default.Children.count(this.props.children) - slidesToShow && !this.props.wrapAround) {
          this.animateSlide(_reactTweenState.default.easingTypes[this.props.edgeEasing]);
        } else {
          this.nextSlide();
        }
      } else if (this.touchObject.direction === -1) {
        if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
          this.animateSlide(_reactTweenState.default.easingTypes[this.props.edgeEasing]);
        } else {
          this.previousSlide();
        }
      }
    } else {
      this.goToSlide(this.state.currentSlide);
    }

    this.touchObject = {};
    this.setState({
      dragging: false
    });
  },
  swipeDirection: function swipeDirection(x1, x2, y1, y2) {
    var xDist = x1 - x2;
    var yDist = y1 - y2;
    var r = Math.atan2(yDist, xDist);
    var swipeAngle = Math.round(r * 180 / Math.PI);

    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }

    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return 1;
    }

    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return 1;
    }

    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return -1;
    }

    if (this.props.vertical === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return 1;
      } else {
        return -1;
      }
    }

    return 0;
  },
  autoplayIterator: function autoplayIterator() {
    if (this.props.wrapAround) {
      this.nextSlide();
      return;
    }

    if (this.state.currentSlide !== this.state.slideCount - this.state.slidesToShow) {
      this.nextSlide();
    } else {
      this.stopAutoplay();
    }
  },
  startAutoplay: function startAutoplay() {
    this.autoplayID = setInterval(this.autoplayIterator, this.props.autoplayInterval);
  },
  resetAutoplay: function resetAutoplay() {
    if (this.props.autoplay && !this.autoplayPaused) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  },
  stopAutoplay: function stopAutoplay() {
    if (this.autoplayID) {
      clearInterval(this.autoplayID);
    }
  },
  // Action Methods
  goToSlide: function goToSlide(index) {
    var _this2 = this;

    if (index >= _react.default.Children.count(this.props.children) || index < 0) {
      if (!this.props.wrapAround) {
        return;
      }

      if (index >= _react.default.Children.count(this.props.children)) {
        this.props.beforeSlide(this.state.currentSlide, 0);
        this.setState({
          currentSlide: 0
        }, function () {
          _this2.animateSlide(null, null, _this2.getTargetLeft(null, index), function () {
            _this2.animateSlide(null, 0.01);

            _this2.props.afterSlide(0);

            _this2.resetAutoplay();

            _this2.setExternalData();
          });
        });
        return;
      } else {
        var endSlide = _react.default.Children.count(this.props.children) - this.state.slidesToScroll;
        this.props.beforeSlide(this.state.currentSlide, endSlide);
        this.setState({
          currentSlide: endSlide
        }, function () {
          _this2.animateSlide(null, null, _this2.getTargetLeft(null, index), function () {
            _this2.animateSlide(null, 0.01);

            _this2.props.afterSlide(endSlide);

            _this2.resetAutoplay();

            _this2.setExternalData();
          });
        });
        return;
      }
    }

    this.props.beforeSlide(this.state.currentSlide, index);

    if (index !== this.state.currentSlide) {
      this.props.afterSlide(index);
    }

    this.setState({
      currentSlide: index
    }, function () {
      _this2.animateSlide();

      _this2.resetAutoplay();

      _this2.setExternalData();
    });
  },
  nextSlide: function nextSlide() {
    var childrenCount = _react.default.Children.count(this.props.children);

    var slidesToShow = this.props.slidesToShow;

    if (this.props.slidesToScroll === 'auto') {
      slidesToShow = this.state.slidesToScroll;
    }

    if (this.state.currentSlide >= childrenCount - slidesToShow && !this.props.wrapAround) {
      return;
    }

    if (this.props.wrapAround) {
      this.goToSlide(this.state.currentSlide + this.state.slidesToScroll);
    } else {
      if (this.props.slideWidth !== 1) {
        this.goToSlide(this.state.currentSlide + this.state.slidesToScroll);
        return;
      }

      this.goToSlide(Math.min(this.state.currentSlide + this.state.slidesToScroll, childrenCount - slidesToShow));
    }
  },
  previousSlide: function previousSlide() {
    if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
      return;
    }

    if (this.props.wrapAround) {
      this.goToSlide(this.state.currentSlide - this.state.slidesToScroll);
    } else {
      this.goToSlide(Math.max(0, this.state.currentSlide - this.state.slidesToScroll));
    }
  },
  // Animation
  animateSlide: function animateSlide(easing, duration, endValue, callback) {
    this.tweenState(this.props.vertical ? 'top' : 'left', {
      easing: easing || _reactTweenState.default.easingTypes[this.props.easing],
      duration: duration || this.props.speed,
      endValue: endValue || this.getTargetLeft(),
      onEnd: callback || null
    });
  },
  getTargetLeft: function getTargetLeft(touchOffset, slide) {
    var offset;
    var target = slide || this.state.currentSlide;

    switch (this.props.cellAlign) {
      case 'left':
        {
          offset = 0;
          offset -= this.props.cellSpacing * target;
          break;
        }

      case 'center':
        {
          offset = (this.state.frameWidth - this.state.slideWidth) / 2;
          offset -= this.props.cellSpacing * target;
          break;
        }

      case 'right':
        {
          offset = this.state.frameWidth - this.state.slideWidth;
          offset -= this.props.cellSpacing * target;
          break;
        }
    }

    var left = this.state.slideWidth * target;
    var lastSlide = this.state.currentSlide > 0 && target + this.state.slidesToScroll >= this.state.slideCount;

    if (lastSlide && this.props.slideWidth !== 1 && !this.props.wrapAround && this.props.slidesToScroll === 'auto') {
      left = this.state.slideWidth * this.state.slideCount - this.state.frameWidth;
      offset = 0;
      offset -= this.props.cellSpacing * (this.state.slideCount - 1);
    }

    offset -= touchOffset || 0;
    return (left - offset) * -1;
  },
  // Bootstrapping
  bindEvents: function bindEvents() {
    if (_exenv.default.canUseDOM) {
      addEvent(window, 'resize', this.onResize);
      addEvent(document, 'readystatechange', this.onReadyStateChange);
    }
  },
  onResize: function onResize() {
    this.setDimensions();
  },
  onReadyStateChange: function onReadyStateChange() {
    this.setDimensions();
  },
  unbindEvents: function unbindEvents() {
    if (_exenv.default.canUseDOM) {
      removeEvent(window, 'resize', this.onResize);
      removeEvent(document, 'readystatechange', this.onReadyStateChange);
    }
  },
  formatChildren: function formatChildren(children) {
    var _this3 = this;

    var positionValue = this.props.vertical ? this.getTweeningValue('top') : this.getTweeningValue('left');
    return _react.default.Children.map(children, function (child, index) {
      return _react.default.createElement("li", {
        className: "slider-slide",
        style: _this3.getSlideStyles(index, positionValue),
        key: index
      }, child);
    });
  },
  setInitialDimensions: function setInitialDimensions() {
    var _this4 = this;

    var slideWidth = this.props.vertical ? this.props.initialSlideHeight || 0 : this.props.initialSlideWidth || 0;
    var slideHeight = this.props.initialSlideHeight ? this.props.initialSlideHeight * this.props.slidesToShow : 0;
    var frameHeight = slideHeight + this.props.cellSpacing * (this.props.slidesToShow - 1);
    this.setState({
      slideHeight: slideHeight,
      frameWidth: this.props.vertical ? frameHeight : '100%',
      slideCount: _react.default.Children.count(this.props.children),
      slideWidth: slideWidth
    }, function () {
      _this4.setLeft();

      _this4.setExternalData();
    });
  },
  setDimensions: function setDimensions(props) {
    var _this5 = this;

    props = props || this.props;
    var slideWidth;
    var slidesToScroll;
    var slideHeight;
    var frame = this.frame;
    var firstSlide = frame.childNodes[0].childNodes[0];
    slidesToScroll = props.slidesToScroll;

    if (firstSlide) {
      firstSlide.style.height = 'auto';
      slideHeight = this.props.vertical ? firstSlide.offsetHeight * props.slidesToShow : firstSlide.offsetHeight;
    } else {
      slideHeight = 100;
    }

    if (this.props.animation === "zoom") {
      slideWidth = frame.offsetWidth - frame.offsetWidth * 15 / 100;
    } else if (typeof props.slideWidth !== 'number') {
      slideWidth = parseInt(props.slideWidth);
    } else if (props.vertical) {
      slideWidth = slideHeight / props.slidesToShow * props.slideWidth;
    } else {
      slideWidth = frame.offsetWidth / props.slidesToShow * props.slideWidth;
    }

    if (!props.vertical) {
      slideWidth -= props.cellSpacing * ((100 - 100 / props.slidesToShow) / 100);
    }

    var frameHeight = slideHeight + props.cellSpacing * (props.slidesToShow - 1);
    var frameWidth = props.vertical ? frameHeight : frame.offsetWidth;

    if (props.slidesToScroll === 'auto') {
      slidesToScroll = Math.floor(frameWidth / (slideWidth + props.cellSpacing));
    }

    this.setState({
      slideHeight: slideHeight,
      frameWidth: frameWidth,
      slideWidth: slideWidth,
      slidesToScroll: slidesToScroll,
      left: props.vertical ? 0 : this.getTargetLeft(),
      top: props.vertical ? this.getTargetLeft() : 0
    }, function () {
      _this5.setLeft();
    });
  },
  setLeft: function setLeft() {
    this.setState({
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    });
  },
  // Data
  setExternalData: function setExternalData() {
    if (this.props.data) {
      this.props.data();
    }
  },
  // Styles
  getListStyles: function getListStyles() {
    var listWidth = this.state.slideWidth * _react.default.Children.count(this.props.children);

    var spacingOffset = this.props.cellSpacing * _react.default.Children.count(this.props.children);

    var transform = "translate3d(".concat(this.getTweeningValue('left'), "px, ").concat(this.getTweeningValue('top'), "px, 0)");
    return {
      transform: transform,
      WebkitTransform: transform,
      msTransform: "translate(".concat(this.getTweeningValue('left'), "px, ").concat(this.getTweeningValue('top'), "px)"),
      position: 'relative',
      display: 'block',
      margin: this.props.vertical ? "".concat(this.props.cellSpacing / 2 * -1, "px 0px") : "0px ".concat(this.props.cellSpacing / 2 * -1, "px"),
      padding: 0,
      height: this.props.vertical ? listWidth + spacingOffset : this.state.slideHeight,
      width: this.props.vertical ? 'auto' : listWidth + spacingOffset,
      cursor: this.state.dragging === true ? 'pointer' : 'inherit',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    };
  },
  getFrameStyles: function getFrameStyles() {
    return {
      position: 'relative',
      display: 'block',
      overflow: this.props.frameOverflow,
      height: this.props.vertical ? this.state.frameWidth || 'initial' : 'auto',
      margin: this.props.framePadding,
      padding: 0,
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      msTransform: 'translate(0, 0)',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    };
  },
  getSlideStyles: function getSlideStyles(index, positionValue) {
    var targetPosition = this.getSlideTargetPosition(index, positionValue);
    return {
      position: 'absolute',
      left: this.props.vertical ? 0 : targetPosition,
      top: this.props.vertical ? targetPosition : 0,
      display: this.props.vertical ? 'block' : 'inline-block',
      listStyleType: 'none',
      verticalAlign: 'top',
      width: this.props.vertical ? '100%' : this.state.slideWidth,
      transition: "transform .4s linear",
      transform: this.props.animation === "zoom" && this.state.currentSlide !== index ? "scale(0.85)" : "scale(1.0)",
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      marginLeft: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginRight: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginTop: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
      marginBottom: this.props.vertical ? this.props.cellSpacing / 2 : 'auto'
    };
  },
  getSlideTargetPosition: function getSlideTargetPosition(index, positionValue) {
    var slidesToShow = this.state.frameWidth / this.state.slideWidth;
    var targetPosition = (this.state.slideWidth + this.props.cellSpacing) * index;
    var end = (this.state.slideWidth + this.props.cellSpacing) * slidesToShow * -1;
    var offset = 0;

    if (this.props.animation === "zoom" && (this.state.currentSlide === index + 1 || this.state.currentSlide === 0 && index === this.props.children.length - 1)) {
      offset = this.props.slideLeftOffset;
    } else if (this.props.animation === "zoom" && (this.state.currentSlide === index - 1 || this.state.currentSlide === this.props.children.length - 1 && index === 0)) {
      offset = -this.props.slideLeftOffset;
    }

    if (this.props.wrapAround) {
      var slidesBefore = Math.ceil(positionValue / this.state.slideWidth);

      if (this.state.slideCount - slidesBefore <= index) {
        return (this.state.slideWidth + this.props.cellSpacing) * (this.state.slideCount - index) * -1 + offset;
      }

      var slidesAfter = Math.ceil((Math.abs(positionValue) - Math.abs(end)) / this.state.slideWidth);

      if (this.state.slideWidth !== 1) {
        slidesAfter = Math.ceil((Math.abs(positionValue) - this.state.slideWidth) / this.state.slideWidth);
      }

      if (index <= slidesAfter - 1) {
        return (this.state.slideWidth + this.props.cellSpacing) * (this.state.slideCount + index) + offset;
      }
    }

    return targetPosition + offset;
  },
  getSliderStyles: function getSliderStyles() {
    return {
      position: 'relative',
      display: 'block',
      width: this.props.width,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      visibility: this.state.slideWidth ? 'visible' : 'hidden'
    };
  },
  getStyleTagStyles: function getStyleTagStyles() {
    return '.slider-slide > img {width: 100%; display: block;}';
  },
  getDecoratorStyles: function getDecoratorStyles(position) {
    switch (position) {
      case 'TopLeft':
        {
          return {
            position: 'absolute',
            top: 0,
            left: 0
          };
        }

      case 'TopCenter':
        {
          return {
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            WebkitTransform: 'translateX(-50%)',
            msTransform: 'translateX(-50%)'
          };
        }

      case 'TopRight':
        {
          return {
            position: 'absolute',
            top: 0,
            right: 0
          };
        }

      case 'CenterLeft':
        {
          return {
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            WebkitTransform: 'translateY(-50%)',
            msTransform: 'translateY(-50%)'
          };
        }

      case 'CenterCenter':
        {
          return {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            WebkitTransform: 'translate(-50%, -50%)',
            msTransform: 'translate(-50%, -50%)'
          };
        }

      case 'CenterRight':
        {
          return {
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            WebkitTransform: 'translateY(-50%)',
            msTransform: 'translateY(-50%)'
          };
        }

      case 'BottomLeft':
        {
          return {
            position: 'absolute',
            bottom: 0,
            left: 0
          };
        }

      case 'BottomCenter':
        {
          return {
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            WebkitTransform: 'translateX(-50%)',
            msTransform: 'translateX(-50%)'
          };
        }

      case 'BottomRight':
        {
          return {
            position: 'absolute',
            bottom: 0,
            right: 0
          };
        }

      default:
        {
          return {
            position: 'absolute',
            top: 0,
            left: 0
          };
        }
    }
  },
  render: function render() {
    var _this6 = this;

    var children = _react.default.Children.count(this.props.children) > 1 ? this.formatChildren(this.props.children) : this.props.children;
    return _react.default.createElement("div", {
      className: ['slider', this.props.className || ''].join(' '),
      style: (0, _objectAssign.default)(this.getSliderStyles(), this.props.style || {})
    }, _react.default.createElement("div", _extends({
      className: "slider-frame",
      ref: function ref(frame) {
        return _this6.frame = frame;
      },
      style: this.getFrameStyles()
    }, this.getTouchEvents(), this.getMouseEvents(), {
      onClick: this.handleClick
    }), _react.default.createElement("ul", {
      className: "slider-list",
      style: this.getListStyles()
    }, children)), this.props.decorators ? this.props.decorators.map(function (Decorator, index) {
      return _react.default.createElement("div", {
        style: (0, _objectAssign.default)(_this6.getDecoratorStyles(Decorator.position), Decorator.style || {}),
        className: "slider-decorator-".concat(index),
        key: index
      }, _react.default.createElement(Decorator.component, {
        currentSlide: _this6.state.currentSlide,
        slideCount: _this6.state.slideCount,
        frameWidth: _this6.state.frameWidth,
        slideWidth: _this6.state.slideWidth,
        slidesToScroll: _this6.state.slidesToScroll,
        cellSpacing: _this6.props.cellSpacing,
        slidesToShow: _this6.props.slidesToShow,
        wrapAround: _this6.props.wrapAround,
        nextSlide: _this6.nextSlide,
        previousSlide: _this6.previousSlide,
        goToSlide: _this6.goToSlide
      }));
    }) : null, _react.default.createElement("style", {
      type: "text/css",
      dangerouslySetInnerHTML: {
        __html: this.getStyleTagStyles()
      }
    }));
  }
});
Carousel.ControllerMixin = {
  getInitialState: function getInitialState() {
    return {
      carousels: {}
    };
  },
  setCarouselData: function setCarouselData(carousel) {
    var data = this.state.carousels;
    data[carousel] = this.refs[carousel];
    this.setState({
      carousels: data
    });
  }
};
var _default = Carousel;
exports.default = _default;