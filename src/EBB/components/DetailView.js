import React from 'react';
import moment from 'moment';

export default function DetailView({ values = {}, fields = [] }) {
    // this function is responsible for display all the label and value based on @fields variable.
    const getLayout = () => {
        return fields
            ?.sort(function (a, b) {
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
            })
            ?.map((field, fieldIndex) => {
                let vl = renderValue(field);
                if (vl && vl !== '') {
                    // this condition make sure that if there is no value then the columne/key will not appear on the screen
                    return (
                        <div key={fieldIndex} className="detail-view-container">
                            <div className="detail-view-heading">
                                {field?.name}
                            </div>
                            <div className="detail-view-data">
                                :
                                <span className="detail-view-margin-left">
                                    {vl}
                                </span>
                            </div>
                        </div>
                    );
                } else {
                    return '';
                }
            });
    };
    // this function is for rendering value and make sure it does not throw error in case value is not present for the matching label
    const renderValue = (field) => {
        let result = values[field?.key]
            ? field?.type && field?.type === 'date'
                ? moment(values[field?.key]).format(field?.formatType)
                : values[field?.key]
            : '';
        if (field?.key === 'nladTribalBenefitFlag') {
            result == 0 ? (result = 'No') : (result = 'Yes');
        }
        return result;
    };
    return (
        <div className="ml-2">
            <div className="detail-view-main">
                {
                    // this function is responsible for displaying labels and values for ebb and nlad sections.
                    getLayout()
                }
            </div>
        </div>
    );
}
