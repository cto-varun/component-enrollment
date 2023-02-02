"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EBB;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _RightTable = _interopRequireDefault(require("./components/RightTable"));
var _Heading = _interopRequireDefault(require("./components/Heading"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// components
// import Sidebar from './components/Sidebar';

const {
  Content
} = _antd.Layout;
function EBB(_ref) {
  let {
    timelineProps,
    ebbWorkflow,
    ebbCreditAdjustmentWorkflow,
    datasource,
    ctn,
    subscribers,
    ebbStatus,
    profiles,
    EBBDetailFields,
    NLADDetailFields,
    ebbDetails,
    nLadDetails,
    datasources,
    programType
  } = _ref;
  const [loading, setLoading] = (0, _react.useState)(false);
  const [errorMessage, setErrorMessage] = (0, _react.useState)(false);
  const [disableCredit, setDisableCredit] = (0, _react.useState)(false);
  const [ebbResponse, setEbbResponse] = (0, _react.useState)({
    enrollmentData: {
      ctn: ctn
    },
    enrollmentTableData: [],
    timelineData: {
      events: []
    }
  });
  const {
    workflow,
    responseMapping,
    successStates,
    errorStates
  } = ebbWorkflow;
  (0, _react.useEffect)(() => {
    handleData(workflow, responseMapping);
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(workflow);
    };
  }, []);
  const handleResponse = disableCreditAdj => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        let response = eventData?.event?.data?.data;
        setEbbResponse({
          ...ebbResponse,
          ...response,
          enrollmentData: {
            ...ebbResponse?.enrollmentData,
            ctn: response?.benefits[0]?.attributes?.find(_ref2 => {
              let {
                key
              } = _ref2;
              return key === 'BroadbandBenefit';
            })?.value,
            enrollmentId: response?.benefits[0]?.benefitCode,
            nextPaymentAmount: response?.benefits[0]?.value,
            nextExecution: response?.benefits[0]?.nextExecution
          },
          enrollmentTableData: response?.benefits[0]?.history || []
        });
        if (disableCreditAdj) {
          setDisableCredit(true);
        }
      }
      if (isFailure) {
        setErrorMessage(eventData?.event?.data?.message || 'No data found matching the request criteria');
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  function handleData(workflow, responseMapping, disableCreditAdj) {
    const registrationId = `${workflow}`;
    setLoading(true);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse(disableCreditAdj), null);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource,
        request: {
          params: {
            billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
          },
          body: {}
        },
        responseMapping
      }
    });
  }
  return /*#__PURE__*/_react.default.createElement(_antd.Layout, {
    className: "bg-transparent"
  }, /*#__PURE__*/_react.default.createElement(Content, {
    className: "bg-transparent",
    style: {
      padding: '0 50px'
    }
  }, loading ? /*#__PURE__*/_react.default.createElement("div", {
    className: "ebb-error"
  }, /*#__PURE__*/_react.default.createElement(_antd.Spin, null)) : errorMessage ? /*#__PURE__*/_react.default.createElement("div", {
    className: "ebb-error"
  }, errorMessage) : /*#__PURE__*/_react.default.createElement(_antd.Layout, {
    className: "site-layout-background bg-transparent",
    style: {
      padding: '24px 0'
    }
  }, /*#__PURE__*/_react.default.createElement(Content, {
    style: {
      padding: '0 24px',
      minHeight: 280
    }
  }, /*#__PURE__*/_react.default.createElement(_RightTable.default, {
    tableData: ebbResponse?.enrollmentTableData,
    enrollmentData: ebbResponse?.enrollmentData,
    ebbCreditAdjustmentWorkflow: ebbCreditAdjustmentWorkflow,
    profiles: profiles,
    disableCredit: disableCredit,
    datasource: datasource,
    ebbStatus: ebbStatus,
    subscribers: subscribers,
    EBBDetailFields: EBBDetailFields,
    NLADDetailFields: NLADDetailFields,
    nLadDetails: nLadDetails,
    ebbDetails: ebbDetails,
    promiseCreatedOn: ebbResponse?.validityPeriod?.start,
    datasources: datasources,
    setDisableCredit: value => setDisableCredit(value),
    handleRefresh: () => handleData(workflow, responseMapping, true),
    programType: programType
  })))));
}
module.exports = exports.default;