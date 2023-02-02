import React, { useState, useEffect } from 'react';
import { Table, Tabs, DatePicker, Row, Col } from 'antd';
import { MessageBus } from '@ivoyant/component-message-bus';
import moment from 'moment';

// components
import EBB from './EBB';

import './styles.css';

 const { RangePicker } = DatePicker;

const autoPayColumns = [
    {
        title: 'APPLICATION ID',
        dataIndex: 'applicationId',
        key: 'applicationId',
    },
    {
        title: 'STATUS',
        dataIndex: 'autoPayStatus',
        key: 'autoPayStatus',
    },
    {
        title: 'DURATION',
        dataIndex: 'autoPayStartDate',
        key: 'autoPayStartDate',
        render: (text, data) => (
            <div>
                {text
                    ? data?.autoPayEndDate
                        ? `${moment(text).format('MM/DD/YYYY')} to ${moment(
                              data.autoPayEndDate
                          ).format('MM/DD/YYYY')}`
                        : `Enrolled on ${moment(text).format('MM/DD/YYYY')}`
                    : '-'}
            </div>
        ),
    },
    {
        title: 'PROFILE USER ID',
        dataIndex: 'profileId',
        key: 'profileId',
    },
    {
        title: 'NOTIFICATION PTN',
        dataIndex: 'notificationCtn',
        key: 'notificationCtn',
    },
    {
        title: 'OPERATOR ID',
        dataIndex: 'operatorId',
        key: 'operatorId',
    },
    {
        title: 'DEALER CODE',
        dataIndex: 'dealerCode',
        key: 'dealerCode',
    },
];

export default function Enrollment(props) {
    const { properties, parentProps, data } = props;
    const [autoPayData, setautoPayData] = useState([]);
    const [bridgePayData, setbridgePayData] = useState([]);
    const [allBridgePayData, setAllBridgePayData] = useState([]);
    const [reqBody, setReqBody] = useState({
        bridgePay: {
            billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN,
        },
        autoPay: {
            billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN,
        },
    });
    const [openedBrigePayKeys, setOpenedBrigePayKeys] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        'No data found matching the request criteria'
    );

    const { ebbDetails } = data.data;

    const {
        workflow,
        responseMapping,
        successStates,
        errorStates,
    } = properties?.autoPayWorkflow;

    const {
        workflow: bridgePayWorkflow,
        responseMapping: bridgePayresponseMapping,
        successStates: bridgePaysuccessStates,
        errorStates: bridgePayerrorStates,
    } = properties?.bridgePayWorkflow;

    const {
        statusKeys,
        timelineProps,
        EBBDetailFields,
        NLADDetailFields,
        ebbWorkflow,
        ebbCreditAdjustmentWorkflow,
    } = properties;

    const bridgePayColumns = [
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (text, data) => {
                return <div>{data?.startDate || ' - '}</div>;
            },
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (text, data) => <div>{data?.endDate || ' - '}</div>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, data) => (
                <div>{statusKeys[data?.status] || ' - '}</div>
            ),
        },
        {
            title: 'Activity Date',
            dataIndex: 'activityDate',
            key: 'activityDate',
            render: (text, data) => <div>{data?.activityDate || ' - '}</div>,
        },

        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, data) => <div>$ {data?.amount || ' - '}</div>,
        },
    ];

    useEffect(() => {
        handleEnrollmentData(
            bridgePayWorkflow,
            bridgePayresponseMapping,
            bridgePaysuccessStates,
            bridgePayerrorStates,
            'bridgePay'
        );
        handleEnrollmentData(
            workflow,
            responseMapping,
            successStates,
            errorStates,
            'autoPay'
        );
        return () => {
            MessageBus.unsubscribe(bridgePayWorkflow);
            MessageBus.unsubscribe(workflow);
        };
    }, []);

    useEffect(() => {
        handleEnrollmentData(
            bridgePayWorkflow,
            bridgePayresponseMapping,
            bridgePaysuccessStates,
            bridgePayerrorStates,
            'bridgePay'
        );
    }, [reqBody.bridgePay]);
    useEffect(() => {
        handleEnrollmentData(
            workflow,
            responseMapping,
            successStates,
            errorStates,
            'autoPay'
        );
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
                setErrorMessage(
                    eventData?.event?.data?.message ||
                        'No data found matching the request criteria'
                );
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    }

    function setData(stateVariable, response) {
        if (stateVariable === 'setautoPayData')
            setautoPayData(response?.length > 0 ? [...response] : []);
        else if (stateVariable === 'setbridgePayData') {
            let newData = [];
            for (let i = 0; i < response.length; i++) {
                let row = response[i];
                if (row?.bridgePayList?.length > 0)
                    newData.push({
                        key: i,
                        ...row?.bridgePayList[0],
                        children: [...row?.bridgePayList],
                    });
            }
            setbridgePayData(newData);
            setAllBridgePayData(response);
            setOpenedBrigePayKeys([]);
        }
    }

    function handleEnrollmentData(
        workflow,
        responseMapping,
        successStates,
        errorStates,
        type
    ) {
        const datasource =
            parentProps.datasources[properties[`${type}Workflow`]?.datasource];
        // const ban = window[window.sessionStorage?.tabId].NEW_BAN;
        const registrationId = `${workflow}`;
        setLoading(true);
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleResponse,
            null,
            type
        );
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource,
                request: {
                    body: reqBody[type],
                },
                responseMapping,
            },
        });
    }
    //const [tabNames, setTabNames] = useState(properties?.tabs);
    const [programType, setProgramType] = useState('');
    const cohorts =
        ebbDetails?.cohorts?.length > 0 &&
        ebbDetails?.cohorts.map((e) => e.toUpperCase());

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

    useEffect(() => {
        if (cohorts.length > 0 && cohorts.includes('ACP')) {
            setProgramType('acp');
        } else if (cohorts.length > 0 && cohorts.includes('EBB')) {
            setProgramType('ebb');
        }
    }, [cohorts]);

    // useEffect(() => {
    //     updateTabsName();
    // }, [cohorts]);

    return (
        <div>
            <Tabs
                defaultActiveKey={
                    props?.routeData?.currentTab?.toString() || '0'
                }
                item = {properties?.tabs.map((tab, index) => {
                    return {
                        label: tab.name,
                        key: index.toString(),
                        disabled: tab.disabled,
                        children: tab.typeOfData === 'ebbProgram' ? (
                            <EBB
                                // timelineProps={timelineProps}
                                ebbWorkflow={ebbWorkflow}
                                ebbCreditAdjustmentWorkflow={
                                    ebbCreditAdjustmentWorkflow
                                }
                                ebbStatus={
                                    data?.data?.ebbBenefit?.status?.length >
                                        0
                                        ? data?.data?.ebbBenefit?.status[0]
                                        : ''
                                }
                                ctn={
                                    data?.data?.ebbDetails?.associations
                                        ?.length > 0
                                        ? data?.data?.ebbDetails
                                            ?.associations[0]?.id
                                        : ''
                                }
                                profiles={data?.data?.profiles?.profiles}
                                ebbDetails={{
                                    firstName:
                                        data?.data?.ebbDetails?.firstName,
                                    lastName:
                                        data?.data?.ebbDetails?.lastName,
                                    ...data?.data?.ebbBenefit,
                                }} // passed for retrieving firstName and lastName
                                subscribers={
                                    data?.data?.subscribers?.subscribers ||
                                    []
                                }
                                datasources={parentProps.datasources}
                                nLadDetails={data?.data?.ebbBenefit} // passed for retrieving nlad details from the selected ebbBenefit object
                                EBBDetailFields={EBBDetailFields} // EBB detail section fields from viewer.json which will be matched using key and populate matching values
                                NLADDetailFields={NLADDetailFields} // NLAD detail section fields from viewer.json which will be matched using key and populate matching values
                                datasource={
                                    parentProps.datasources[
                                    properties[`ebbWorkflow`]
                                        ?.datasource
                                    ]
                                }
                                programType={programType}
                            />
                        ) : (
                            renderData(tab.typeOfData)
                        )
                    }
                })}
            > </Tabs>
        </div>
    );

    function handlePagination(pagination, typeOfData) {
        setReqBody({
            ...reqBody,
            [typeOfData]: {
                ...reqBody[typeOfData],
                maxRecords: pagination.pageSize,
            },
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
                        toDate: valueString[1],
                    },
                },
            });
        } else {
            if (reqBody[typeOfData]?.byDate) {
                delete reqBody[typeOfData].byDate;
            }
            setReqBody({
                ...reqBody,
                [typeOfData]: {
                    ...reqBody[typeOfData],
                },
            });
        }
    }

    function renderData(typeOfData) {
        return (
            <>
                <Row className="row-container-bridgepay">
                    <Col xs={12}>
                        {typeOfData === 'autoPay' && (
                            <RangePicker
                                onChange={(values, valueString) => {
                                    handleDateRange(
                                        values,
                                        valueString,
                                        typeOfData
                                    );
                                }}
                            />
                        )}
                    </Col>
                    <Col xs={24}>
                        <Table
                            columns={eval(`${typeOfData}Columns`)}
                            dataSource={eval(`${typeOfData}Data`) || []}
                            rowClassName="bg-transparent"
                            className="bg-transparent"
                            locale={{ emptyText: errorMessage }}
                            loading={loading}
                            expandable={false}
                            pagination={{
                                position: ['topRight'],
                                showSizeChanger: true,
                            }}
                            onChange={(pagination) => {
                                handlePagination(pagination, typeOfData);
                            }}
                        />
                    </Col>
                </Row>
            </>
        );
    }
}
