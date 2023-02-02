"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Title
} = _antd.Typography;
var _default = props => {
  const {
    title = 'Heading',
    level = 2,
    color = '#444',
    paddingBottom = '30px',
    styles = {},
    box = null,
    contentClassName = null
  } = props;
  return /*#__PURE__*/_react.default.createElement(Title, {
    level: level,
    style: {
      color: color,
      paddingBottom: paddingBottom,
      ...styles
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: contentClassName
  }, title));
};
exports.default = _default;
module.exports = exports.default;