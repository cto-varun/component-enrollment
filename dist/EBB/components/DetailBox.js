"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DetailBox;
var _react = _interopRequireDefault(require("react"));
var _DetailView = _interopRequireDefault(require("./DetailView"));
var _Heading = _interopRequireDefault(require("./Heading"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function DetailBox(props) {
  const {
    viewToRender = 'ebb',
    EBBDetailFields,
    ebbDetailValues,
    title = 'EBB Details',
    NLADDetailFields,
    nladDetailValues,
    programType
  } = props;
  const getFields = () => viewToRender === 'ebb' ? EBBDetailFields : NLADDetailFields;
  const getValues = () => viewToRender === 'ebb' ? ebbDetailValues : nladDetailValues;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    title: title,
    level: 4,
    styles: {
      marginTop: '4rem',
      color: '#434343',
      padding: '0.5rem 0.5rem 0 0.5rem',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Poppins',
      borderTop: 'dotted 1px #8C8C8C',
      display: 'flex'
    },
    contentClassName: "ebb-heading-container"
  }), /*#__PURE__*/_react.default.createElement(_DetailView.default, {
    fields: getFields(),
    values: getValues(),
    viewToRender: viewToRender
  }));
}
module.exports = exports.default;