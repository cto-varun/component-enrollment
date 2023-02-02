import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';

// components
// import Sidebar from './components/Sidebar';
import RightTable from './components/RightTable';
import Heading from './components/Heading';

import { MessageBus } from '@ivoyant/component-message-bus';

const { Content } = Layout;

export default function EBB({
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
    programType,
}) {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [disableCredit, setDisableCredit] = useState(false);

    const [ebbResponse, setEbbResponse] = useState({
        enrollmentData: {
            ctn: ctn,
        },
        enrollmentTableData: [],
        timelineData: {
            events: [],
        },
    });

    const {
        workflow,
        responseMapping,
        successStates,
        errorStates,
    } = ebbWorkflow;

    useEffect(() => {
        handleData(workflow, responseMapping);
        return () => {
            MessageBus.unsubscribe(workflow);
        };
    }, []);

    const handleResponse = (disableCreditAdj) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
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
                        ctn: response?.benefits[0]?.attributes?.find(
                            ({ key }) => key === 'BroadbandBenefit'
                        )?.value,
                        enrollmentId: response?.benefits[0]?.benefitCode,
                        nextPaymentAmount: response?.benefits[0]?.value,
                        nextExecution: response?.benefits[0]?.nextExecution,
                    },
                    enrollmentTableData: response?.benefits[0]?.history || [],
                });
                if (disableCreditAdj) {
                    setDisableCredit(true);
                }
            }
            if (isFailure) {
                setErrorMessage(
                    eventData?.event?.data?.message ||
                        'No data found matching the request criteria'
                );
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    function handleData(workflow, responseMapping, disableCreditAdj) {
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
            handleResponse(disableCreditAdj),
            null
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
                    params: {
                        billingAccountNumber:
                            window[window.sessionStorage?.tabId].NEW_BAN,
                    },
                    body: {},
                },
                responseMapping,
            },
        });
    }

    return (
        <Layout className="bg-transparent">
            <Content className="bg-transparent" style={{ padding: '0 50px' }}>
                {loading ? (
                    <div className="ebb-error">
                        <Spin />
                    </div>
                ) : errorMessage ? (
                    <div className="ebb-error">{errorMessage}</div>
                ) : (
                    <Layout
                        className="site-layout-background bg-transparent"
                        style={{ padding: '24px 0' }}
                    >
                        {/* <Sider
                                    className="site-layout-background bg-transparent"
                                    width={350}
                                >
                                    <Sidebar
                                        timelineProps={timelineProps}
                                        timelineData={ebbResponse?.timelineData}
                                    />
                                </Sider> */}
                        {/* <Heading title="EBB History Timeline" level={4} /> */}
                        <Content style={{ padding: '0 24px', minHeight: 280 }}>
                            <RightTable
                                tableData={ebbResponse?.enrollmentTableData}
                                enrollmentData={ebbResponse?.enrollmentData}
                                ebbCreditAdjustmentWorkflow={
                                    ebbCreditAdjustmentWorkflow
                                }
                                profiles={profiles}
                                disableCredit={disableCredit}
                                datasource={datasource}
                                ebbStatus={ebbStatus}
                                subscribers={subscribers}
                                EBBDetailFields={EBBDetailFields}
                                NLADDetailFields={NLADDetailFields}
                                nLadDetails={nLadDetails}
                                ebbDetails={ebbDetails}
                                promiseCreatedOn={
                                    ebbResponse?.validityPeriod?.start
                                }
                                datasources={datasources}
                                setDisableCredit={(value) =>
                                    setDisableCredit(value)
                                }
                                handleRefresh={() =>
                                    handleData(workflow, responseMapping, true)
                                }
                                programType={programType}
                            />
                        </Content>
                    </Layout>
                )}
            </Content>
        </Layout>
    );
}
