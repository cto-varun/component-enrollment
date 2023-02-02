"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Enrollment;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _moment = _interopRequireDefault(require("moment"));
var _EBB = _interopRequireDefault(require("./EBB"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// components

const {
  RangePicker
} = _antd.DatePicker;
const autoPayColumns = [{
  title: 'APPLICATION ID',
  dataIndex: 'applicationId',
  key: 'applicationId'
}, {
  title: 'STATUS',
  dataIndex: 'autoPayStatus',
  key: 'autoPayStatus'
}, {
  title: 'DURATION',
  dataIndex: 'autoPayStartDate',
  key: 'autoPayStartDate',
  render: (text, data) => /*#__PURE__*/_react.default.createElement("div", null, text ? data?.autoPayEndDate ? `${(0, _moment.default)(text).format('MM/DD/YYYY')} to ${(0, _moment.default)(data.autoPayEndDate).format('MM/DD/YYYY')}` : `Enrolled on ${(0, _moment.default)(text).format('MM/DD/YYYY')}` : '-')
}, {
  title: 'PROFILE USER ID',
  dataIndex: 'profileId',
  key: 'profileId'
}, {
  title: 'NOTIFICATION PTN',
  dataIndex: 'notificationCtn',
  key: 'notificationCtn'
}, {
  title: 'OPERATOR ID',
  dataIndex: 'operatorId',
  key: 'operatorId'
}, {
  title: 'DEALER CODE',
  dataIndex: 'dealerCode',
  key: 'dealerCode'
}];
function Enrollment(props) {
  const {
    properties,
    parentProps,
    data
  } = props;
  const [autoPayData, setautoPayData] = (0, _react.useState)([]);
  const [bridgePayData, setbridgePayData] = (0, _react.useState)([]);
  const [allBridgePayData, setAllBridgePayData] = (0, _react.useState)([]);
  const [reqBody, setReqBody] = (0, _react.useState)({
    bridgePay: {
      billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
    },
    autoPay: {
      billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
    }
  });
  const [openedBrigePayKeys, setOpenedBrigePayKeys] = (0, _react.useState)([]);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [errorMessage, setErrorMessage] = (0, _react.useState)('No data found matching the request criteria');
  const {
    ebbDetails
  } = data.data;
  const {
    workflow,
    responseMapping,
    successStates,
    errorStates
  } = properties?.autoPayWorkflow;
  const {
    workflow: bridgePayWorkflow,
    responseMapping: bridgePayresponseMapping,
    successStates: bridgePaysuccessStates,
    errorStates: bridgePayerrorStates
  } = properties?.bridgePayWorkflow;
  const {
    statusKeys,
    timelineProps,
    EBBDetailFields,
    NLADDetailFields,
    ebbWorkflow,
    ebbCreditAdjustmentWorkflow
  } = properties;
  const bridgePayColumns = [{
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    render: (text, data) => {
      return /*#__PURE__*/_react.default.createElement("div", null, data?.startDate || ' - ');
    }
  }, {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
    render: (text, data) => /*#__PURE__*/_react.default.createElement("div", null, data?.endDate || ' - ')
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text, data) => /*#__PURE__*/_react.default.createElement("div", null, statusKeys[data?.status] || ' - ')
  }, {
    title: 'Activity Date',
    dataIndex: 'activityDate',
    key: 'activityDate',
    render: (text, data) => /*#__PURE__*/_react.default.createElement("div", null, data?.activityDate || ' - ')
  }, {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (text, data) => /*#__PURE__*/_react.default.createElement("div", null, "$ ", data?.amount || ' - ')
  }];
  (0, _react.useEffect)(() => {
    handleEnrollmentData(bridgePayWorkflow, bridgePayresponseMapping, bridgePaysuccessStates, bridgePayerrorStates, 'bridgePay');
    handleEnrollmentData(workflow, responseMapping, successStates, errorStates, 'autoPay');
    return () => {
      _componentMessageBus.MessageBus.unsubscribe(bridgePayWorkflow);
      _componentMessageBus.MessageBus.unsubscribe(workflow);
    };
  }, []);
  (0, _react.useEffect)(() => {
    handleEnrollmentData(bridgePayWorkflow, bridgePayresponseMapping, bridgePaysuccessStates, bridgePayerrorStates, 'bridgePay');
  }, [reqBody.bridgePay]);
  (0, _react.useEffect)(() => {
    handleEnrollmentData(workflow, responseMapping, successStates, errorStates, 'autoPay');
  }, [reqBody.autoPay]);
  function handleResponse(subscriptionId, topic, eventData, closure, type) {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      let stateVariable = `set${type}Data`;
      if (isSuccess) {
        let response = eventData?.event?.data?.data;
        setData(stateVariable, response);
      }
      if (isFailure) {
        setData(stateVariable, []);
        setErrorMessage(eventData?.event?.data?.message || 'No data found matching the request criteria');
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  }
  function setData(stateVariable, response) {
    if (stateVariable === 'setautoPayData') setautoPayData(response?.length > 0 ? [...response] : []);else if (stateVariable === 'setbridgePayData') {
      let newData = [];
      for (let i = 0; i < response.length; i++) {
        let row = response[i];
        if (row?.bridgePayList?.length > 0) newData.push({
          key: i,
          ...row?.bridgePayList[0],
          children: [...row?.bridgePayList]
        });
      }
      setbridgePayData(newData);
      setAllBridgePayData(response);
      setOpenedBrigePayKeys([]);
    }
  }
  function handleEnrollmentData(workflow, responseMapping, successStates, errorStates, type) {
    const datasource = parentProps.datasources[properties[`${type}Workflow`]?.datasource];
    // const ban = window[window.sessionStorage?.tabId].NEW_BAN;
    const registrationId = `${workflow}`;
    setLoading(true);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse, null, type);
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource,
        request: {
          body: reqBody[type]
        },
        responseMapping
      }
    });
  }
  //const [tabNames, setTabNames] = useState(properties?.tabs);
  const [programType, setProgramType] = (0, _react.useState)('');
  const cohorts = ebbDetails?.cohorts?.length > 0 && ebbDetails?.cohorts.map(e => e.toUpperCase());

  // function updateTabsName() {
  //     if (cohorts.length > 0 && cohorts.includes('ACP')) {
  //         setTabNames((prev) => {
  //             return [
  //                 ...prev,
  //                 {
  //                     name: 'ACP Program',
  //                     typeOfData: 'acpProgram',
  //                 },
  //             ];
  //         });
  //     } else if (cohorts.length > 0 && cohorts.includes('EBB')) {
  //         setTabNames((prev) => {
  //             return [
  //                 ...prev,
  //                 {
  //                     name: 'EBB Program',
  //                     typeOfData: 'ebbProgram',
  //                 },
  //             ];
  //         });
  //     }
  // }

  (0, _react.useEffect)(() => {
    if (cohorts.length > 0 && cohorts.includes('ACP')) {
      setProgramType('acp');
    } else if (cohorts.length > 0 && cohorts.includes('EBB')) {
      setProgramType('ebb');
    }
  }, [cohorts]);

  // useEffect(() => {
  //     updateTabsName();
  // }, [cohorts]);

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Tabs, {
    defaultActiveKey: props?.routeData?.currentTab?.toString() || '0',
    item: properties?.tabs.map((tab, index) => {
      return {
        label: tab.name,
        key: index.toString(),
        disabled: tab.disabled,
        children: tab.typeOfData === 'ebbProgram' ? /*#__PURE__*/_react.default.createElement(_EBB.default
        // timelineProps={timelineProps}
        , {
          ebbWorkflow: ebbWorkflow,
          ebbCreditAdjustmentWorkflow: ebbCreditAdjustmentWorkflow,
          ebbStatus: data?.data?.ebbBenefit?.status?.length > 0 ? data?.data?.ebbBenefit?.status[0] : '',
          ctn: data?.data?.ebbDetails?.associations?.length > 0 ? data?.data?.ebbDetails?.associations[0]?.id : '',
          profiles: data?.data?.profiles?.profiles,
          ebbDetails: {
            firstName: data?.data?.ebbDetails?.firstName,
            lastName: data?.data?.ebbDetails?.lastName,
            ...data?.data?.ebbBenefit
          } // passed for retrieving firstName and lastName
          ,
          subscribers: data?.data?.subscribers?.subscribers || [],
          datasources: parentProps.datasources,
          nLadDetails: data?.data?.ebbBenefit // passed for retrieving nlad details from the selected ebbBenefit object
          ,
          EBBDetailFields: EBBDetailFields // EBB detail section fields from viewer.json which will be matched using key and populate matching values
          ,
          NLADDetailFields: NLADDetailFields // NLAD detail section fields from viewer.json which will be matched using key and populate matching values
          ,
          datasource: parentProps.datasources[properties[`ebbWorkflow`]?.datasource],
          programType: programType
        }) : renderData(tab.typeOfData)
      };
    })
  }, " "));
  function handlePagination(pagination, typeOfData) {
    setReqBody({
      ...reqBody,
      [typeOfData]: {
        ...reqBody[typeOfData],
        maxRecords: pagination.pageSize
      }
    });
  }
  function handleDateRange(values, valueString, typeOfData) {
    if (valueString[0]) {
      setReqBody({
        ...reqBody,
        [typeOfData]: {
          ...reqBody[typeOfData],
          byDate: {
            ...reqBody[typeOfData]?.byDate,
            fromDate: valueString[0],
            toDate: valueString[1]
          }
        }
      });
    } else {
      if (reqBody[typeOfData]?.byDate) {
        delete reqBody[typeOfData].byDate;
      }
      setReqBody({
        ...reqBody,
        [typeOfData]: {
          ...reqBody[typeOfData]
        }
      });
    }
  }
  function renderData(typeOfData) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
      className: "row-container-bridgepay"
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 12
    }, typeOfData === 'autoPay' && /*#__PURE__*/_react.default.createElement(RangePicker, {
      onChange: (values, valueString) => {
        handleDateRange(values, valueString, typeOfData);
      }
    })), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: 24
    }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
      columns: eval(`${typeOfData}Columns`),
      dataSource: eval(`${typeOfData}Data`) || [],
      rowClassName: "bg-transparent",
      className: "bg-transparent",
      locale: {
        emptyText: errorMessage
      },
      loading: loading,
      expandable: false,
      pagination: {
        position: ['topRight'],
        showSizeChanger: true
      },
      onChange: pagination => {
        handlePagination(pagination, typeOfData);
      }
    }))));
  }
}
module.exports = exports.default;