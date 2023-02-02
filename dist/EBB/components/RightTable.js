"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RightTable;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
var _Heading = _interopRequireDefault(require("./Heading"));
var _DetailBox = _interopRequireDefault(require("./DetailBox"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// components
// import DetailView from './DetailView';

function RightTable(_ref) {
  let {
    tableData,
    enrollmentData,
    ebbStatus,
    EBBDetailFields,
    NLADDetailFields,
    nLadDetails,
    ebbDetails,
    promiseCreatedOn,
    subscribers,
    ebbCreditAdjustmentWorkflow,
    datasources,
    handleRefresh,
    setDisableCredit,
    disableCredit,
    profiles,
    programType
  } = _ref;
  const [loading, setLoading] = (0, _react.useState)(false);
  let ebbStatusDetails = {};
  if (ebbStatus && ebbStatus.value.trim().toLowerCase() === 'inactive') {
    ebbStatusDetails = {
      ineligibilityDate: ebbStatus?.statusDate
    };
  } else {
    ebbStatusDetails = {
      ebbStatusValue: ebbStatus?.value,
      statusDate: ebbStatus?.statusDate,
      reason: ebbStatus?.reason
    };
  }
  const activatedOn = subscribers?.find(_ref2 => {
    let {
      subscriberDetails
    } = _ref2;
    return subscriberDetails?.phoneNumber === ebbDetails?.id || subscriberDetails?.phoneNumber === ebbDetails?.phoneNumberInEbbp;
  })?.subscriberDetails?.initActivationDate;
  const ebbDetailValues = {
    ...enrollmentData,
    ...ebbStatusDetails,
    ...ebbDetails,
    activatedOn,
    promiseCreatedOn
  }; // created matching with matching key so that our ebb fields object named EBBDetailFields from viewer.json can get the matching values
  const {
    nladTelephoneNumber,
    nladServiceInitiationDate,
    nladTribalBenefitFlag,
    nladLastStatusDate,
    nladSubscriberId,
    sac,
    nladLastStatus
  } = nLadDetails;
  const nladDetailValues = {
    ...ebbDetails,
    nladTelephoneNumber,
    nladServiceInitiationDate,
    nladTribalBenefitFlag,
    nladLastStatusDate,
    nladSubscriberId,
    sac,
    nladLastStatus
  }; // created matching with matching key so that our NLAD fields object named NLADDetailFields from viewer.json can get the matching values

  const columns = [{
    title: 'ENROLLMENT ID',
    dataIndex: 'enrollmentId',
    key: 'enrollmentId',
    className: 'ebb-program-table-row',
    render: () => {
      return enrollmentData?.enrollmentId;
    }
  }, {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    className: 'ebb-program-table-row'
  }, {
    title: 'CreatedAt',
    dataIndex: 'creationDate',
    key: 'creationDate',
    className: 'ebb-program-table-row',
    render: dt => {
      return (0, _moment.default)(dt).format('YYYY-MM-DD');
    }
  }, {
    title: 'Status Reason',
    dataIndex: 'statusReason',
    key: 'statusReason',
    className: 'ebb-program-table-row',
    render: (dt, record) => {
      return record?.status?.trim()?.toLowerCase() === 'pending' ? `Pending promise payment for ${programType.toUpperCase()} application on the next bill cycle` : dt;
    }
  }];
  const {
    datasource,
    workflow,
    responseMapping,
    successStates,
    errorStates
  } = ebbCreditAdjustmentWorkflow;
  function handleResponse(subscriptionId, topic, eventData, closure) {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setDisableCredit(true);
      }
      if (isFailure) {}
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  }
  const handleEbbCredit = () => {
    const registrationId = `${workflow}`;
    setLoading(true);
    console.log(datasource, workflow);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse, null);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
          },
          body: {}
        },
        responseMapping
      }
    });
  };
  const enableCreditAdj = profiles?.find(c => c.name === window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile)?.categories?.find(c => c.name === 'ebbAdjustments')?.enable;
  const [detailBoxTitle, setDetailBoxTitle] = (0, _react.useState)('');
  (0, _react.useEffect)(() => {
    if (programType !== '' && programType === 'acp') {
      setDetailBoxTitle('ACP Details');
    } else if (programType !== '' && programType === 'ebb') {
      setDetailBoxTitle('EBB Details');
    }
  }, [programType]);
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_DetailBox.default, {
    title: detailBoxTitle,
    viewToRender: "ebb",
    EBBDetailFields: EBBDetailFields,
    ebbDetailValues: ebbDetailValues,
    programType: programType
  }), /*#__PURE__*/_react.default.createElement(_DetailBox.default, {
    title: "NLAD Details",
    viewToRender: "nlad",
    NLADDetailFields: NLADDetailFields,
    nladDetailValues: nladDetailValues
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "ebb-program-table-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    title: "Transactional Details",
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
  }), enableCreditAdj && enableCreditAdj === 'true' && /*#__PURE__*/_react.default.createElement("div", {
    className: "mb-1"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: disableCredit ? 'default' : 'primary',
    disabled: disableCredit,
    loading: loading,
    onClick: () => handleEbbCredit()
  }, "Apply Missing Credit"), disableCredit && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "ml-2 ",
    type: "primary",
    onClick: () => handleRefresh()
  }, "Refresh")), /*#__PURE__*/_react.default.createElement(_antd.Table, {
    columns: columns,
    dataSource: tableData,
    rowClassName: "ebb-program-table-row",
    className: "ebb-program-table",
    pagination: false
  })));
}
module.exports = exports.default;