import React, { useState, useEffect } from 'react';
import { Button, Table } from 'antd';
import moment from 'moment';
// components
// import DetailView from './DetailView';
import Heading from './Heading';
import DetailBox from './DetailBox';
import { MessageBus } from '@ivoyant/component-message-bus';

export default function RightTable({
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
    programType,
}) {
    const [loading, setLoading] = useState(false);
    let ebbStatusDetails = {};
    if (ebbStatus && ebbStatus.value.trim().toLowerCase() === 'inactive') {
        ebbStatusDetails = {
            ineligibilityDate: ebbStatus?.statusDate,
        };
    } else {
        ebbStatusDetails = {
            ebbStatusValue: ebbStatus?.value,
            statusDate: ebbStatus?.statusDate,
            reason: ebbStatus?.reason,
        };
    }

    const activatedOn = subscribers?.find(
        ({ subscriberDetails }) =>
            subscriberDetails?.phoneNumber === ebbDetails?.id ||
            subscriberDetails?.phoneNumber === ebbDetails?.phoneNumberInEbbp
    )?.subscriberDetails?.initActivationDate;

    const ebbDetailValues = {
        ...enrollmentData,
        ...ebbStatusDetails,
        ...ebbDetails,
        activatedOn,
        promiseCreatedOn,
    }; // created matching with matching key so that our ebb fields object named EBBDetailFields from viewer.json can get the matching values
    const {
        nladTelephoneNumber,
        nladServiceInitiationDate,
        nladTribalBenefitFlag,
        nladLastStatusDate,
        nladSubscriberId,
        sac,
        nladLastStatus,
    } = nLadDetails;
    const nladDetailValues = {
        ...ebbDetails,
        nladTelephoneNumber,
        nladServiceInitiationDate,
        nladTribalBenefitFlag,
        nladLastStatusDate,
        nladSubscriberId,
        sac,
        nladLastStatus,
    }; // created matching with matching key so that our NLAD fields object named NLADDetailFields from viewer.json can get the matching values

    const columns = [
        {
            title: 'ENROLLMENT ID',
            dataIndex: 'enrollmentId',
            key: 'enrollmentId',
            className: 'ebb-program-table-row',
            render: () => {
                return enrollmentData?.enrollmentId;
            },
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            className: 'ebb-program-table-row',
        },
        {
            title: 'CreatedAt',
            dataIndex: 'creationDate',
            key: 'creationDate',
            className: 'ebb-program-table-row',
            render: (dt) => {
                return moment(dt).format('YYYY-MM-DD');
            },
        },
        {
            title: 'Status Reason',
            dataIndex: 'statusReason',
            key: 'statusReason',
            className: 'ebb-program-table-row',
            render: (dt, record) => {
                return record?.status?.trim()?.toLowerCase() === 'pending'
                    ? `Pending promise payment for ${programType.toUpperCase()} application on the next bill cycle`
                    : dt;
            },
        },
    ];

    const {
        datasource,
        workflow,
        responseMapping,
        successStates,
        errorStates,
    } = ebbCreditAdjustmentWorkflow;

    function handleResponse(subscriptionId, topic, eventData, closure) {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                setDisableCredit(true);
            }
            if (isFailure) {
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    }

    const handleEbbCredit = () => {
        const registrationId = `${workflow}`;
        setLoading(true);
        console.log(datasource, workflow);
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
            null
        );
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
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
    };

    const enableCreditAdj = profiles
        ?.find(
            (c) =>
                c.name ===
                window[window.sessionStorage?.tabId].COM_IVOYANT_VARS.profile
        )
        ?.categories?.find((c) => c.name === 'ebbAdjustments')?.enable;

    const [detailBoxTitle, setDetailBoxTitle] = useState('');
    useEffect(() => {
        if (programType !== '' && programType === 'acp') {
            setDetailBoxTitle('ACP Details');
        } else if (programType !== '' && programType === 'ebb') {
            setDetailBoxTitle('EBB Details');
        }
    }, [programType]);
    return (
        <div>
            {/* DetailBox component is for displaying the sections with respective values passed to it. viewToRender variable will help to populate the required labels and object */}
            <DetailBox
                title={detailBoxTitle}
                viewToRender="ebb"
                EBBDetailFields={EBBDetailFields}
                ebbDetailValues={ebbDetailValues}
                programType={programType}
            />
            <DetailBox
                title="NLAD Details"
                viewToRender="nlad"
                NLADDetailFields={NLADDetailFields}
                nladDetailValues={nladDetailValues}
            />

            <div className="ebb-program-table-wrapper">
                <Heading
                    title="Transactional Details"
                    level={4}
                    styles={{
                        marginTop: '4rem',
                        color: '#434343',
                        padding: '0.5rem 0.5rem 0 0.5rem',
                        fontSize: '14px',
                        fontWeight: '500',
                        fontFamily: 'Poppins',
                        borderTop: 'dotted 1px #8C8C8C',
                        display: 'flex',
                    }}
                    contentClassName="ebb-heading-container"
                />
                {enableCreditAdj && enableCreditAdj === 'true' && (
                    <div className="mb-1">
                        <Button
                            type={disableCredit ? 'default' : 'primary'}
                            disabled={disableCredit}
                            loading={loading}
                            onClick={() => handleEbbCredit()}
                        >
                            Apply Missing Credit
                        </Button>
                        {disableCredit && (
                            <Button
                                className="ml-2 "
                                type="primary"
                                onClick={() => handleRefresh()}
                            >
                                Refresh
                            </Button>
                        )}
                    </div>
                )}
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowClassName="ebb-program-table-row"
                    className="ebb-program-table"
                    pagination={false}
                />
            </div>
        </div>
    );
}
