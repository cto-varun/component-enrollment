"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DetailView;
var _react = _interopRequireDefault(require("react"));
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function DetailView(_ref) {
  let {
    values = {},
    fields = []
  } = _ref;
  // this function is responsible for display all the label and value based on @fields variable.
  const getLayout = () => {
    return fields?.sort(function (a, b) {
      var keyA = a.key.toUpperCase();
      var keyB = b.key.toUpperCase();
      if (keyA < keyB) {
        return -1;
      }
      if (keyA > keyB) {
        return 1;
      }

      // if keys are equal must be equal
      return 0;
    })?.map((field, fieldIndex) => {
      let vl = renderValue(field);
      if (vl && vl !== '') {
        // this condition make sure that if there is no value then the columne/key will not appear on the screen
        return /*#__PURE__*/_react.default.createElement("div", {
          key: fieldIndex,
          className: "detail-view-container"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "detail-view-heading"
        }, field?.name), /*#__PURE__*/_react.default.createElement("div", {
          className: "detail-view-data"
        }, ":", /*#__PURE__*/_react.default.createElement("span", {
          className: "detail-view-margin-left"
        }, vl)));
      } else {
        return '';
      }
    });
  };
  // this function is for rendering value and make sure it does not throw error in case value is not present for the matching label
  const renderValue = field => {
    let result = values[field?.key] ? field?.type && field?.type === 'date' ? (0, _moment.default)(values[field?.key]).format(field?.formatType) : values[field?.key] : '';
    if (field?.key === 'nladTribalBenefitFlag') {
      result == 0 ? result = 'No' : result = 'Yes';
    }
    return result;
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "detail-view-main"
  },
  // this function is responsible for displaying labels and values for ebb and nlad sections.
  getLayout()));
}
module.exports = exports.default;