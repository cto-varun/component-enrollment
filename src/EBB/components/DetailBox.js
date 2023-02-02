import React from 'react';
import DetailView from './DetailView';
import Heading from './Heading';

export default function DetailBox(props) {
    const {
        viewToRender = 'ebb',
        EBBDetailFields,
        ebbDetailValues,
        title = 'EBB Details',
        NLADDetailFields,
        nladDetailValues,
        programType,
    } = props;
    const getFields = () =>
        viewToRender === 'ebb' ? EBBDetailFields : NLADDetailFields;
    const getValues = () =>
        viewToRender === 'ebb' ? ebbDetailValues : nladDetailValues;
    return (
        <>
            <Heading
                title={title}
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
            {/* DetailView component will render the fields based on the viewToRender variable value and the same component will be passed only required fields and values based on again viewToRender variable. */}
            <DetailView
                fields={getFields()}
                values={getValues()}
                viewToRender={viewToRender}
            />
        </>
    );
}
