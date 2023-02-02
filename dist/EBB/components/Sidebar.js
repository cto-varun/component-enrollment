"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Sidebar;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _Heading = _interopRequireDefault(require("./Heading"));
var _componentTimeline = require("@ivoyant/component-timeline");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// components

const prefixSearch = /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
  style: {
    fontSize: 16,
    color: "rgb(152, 152, 152)"
  }
});
const {
  RangePicker
} = _antd.DatePicker;
const menu = /*#__PURE__*/_react.default.createElement(_antd.Menu, null, /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, null, /*#__PURE__*/_react.default.createElement("a", {
  target: "_blank",
  rel: "noopener noreferrer"
}, "1st menu item")), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, null, /*#__PURE__*/_react.default.createElement("a", {
  target: "_blank",
  rel: "noopener noreferrer"
}, "2nd menu item")));
function Sidebar(_ref) {
  let {
    timelineProps,
    timelineData
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    title: "EBB History Timeline",
    level: 4,
    color: "rgb(152, 152, 152)"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "search-input-container"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "search-input-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Search",
    size: "large",
    prefix: prefixSearch,
    onSearch: () => {}
  })), /*#__PURE__*/_react.default.createElement(RangePicker, {
    format: "DD MMM",
    picker: "date",
    className: "ebb-range-picker",
    suffixIcon: false
  })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: "sidebar-dropdown-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: menu
  }, /*#__PURE__*/_react.default.createElement("a", {
    className: "ant-dropdown-link sidebar-dropdown",
    onClick: e => e.preventDefault()
  }, "FILTER BY ", /*#__PURE__*/_react.default.createElement(_icons.DownOutlined, null))), /*#__PURE__*/_react.default.createElement(_antd.Divider, null)), /*#__PURE__*/_react.default.createElement(_componentTimeline.component, {
    data: {
      data: {
        accountEvents: timelineData
      }
    },
    properties: timelineProps
  })));
}
module.exports = exports.default;